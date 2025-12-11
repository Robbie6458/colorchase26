import os
import hashlib
import math
import secrets
import json
from datetime import datetime, date, timedelta
from functools import wraps
from flask import Flask, send_from_directory, jsonify, request, session, redirect
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
from oauthlib.oauth2 import WebApplicationClient

app = Flask(__name__, static_folder='.')
app.secret_key = os.environ.get('SESSION_SECRET') or secrets.token_hex(32)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_OAUTH_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET')
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

google_client = None
if GOOGLE_CLIENT_ID:
    google_client = WebApplicationClient(GOOGLE_CLIENT_ID)

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def init_db():
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255),
                    google_sub VARCHAR(255),
                    player_name VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            try:
                cur.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255)')
                cur.execute('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL')
            except:
                pass
            cur.execute('''
                CREATE TABLE IF NOT EXISTS palettes (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    date VARCHAR(10) NOT NULL,
                    colors TEXT[] NOT NULL,
                    scheme VARCHAR(50),
                    guess_count INTEGER DEFAULT 5,
                    won BOOLEAN DEFAULT FALSE,
                    is_favorite BOOLEAN DEFAULT FALSE,
                    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, date)
                )
            ''')
        conn.commit()

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Not logged in'}), 401
        return f(*args, **kwargs)
    return decorated

def seeded_random(seed_str):
    hash_val = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)
    x = math.sin(hash_val) * 10000
    return x - math.floor(x)

def hsl_to_hex(h, s, l):
    s /= 100
    l /= 100
    a = s * min(l, 1 - l)
    def f(n):
        k = (n + h / 30) % 12
        color = l - a * max(min(k - 3, 9 - k, 1), -1)
        return round(255 * color)
    return '#{:02X}{:02X}{:02X}'.format(f(0), f(8), f(4))

def generate_color_wheel(hue_shift):
    colors = []
    for i in range(12):
        hue = (i * 30 + hue_shift) % 360
        saturation = 70 + (i % 3) * 10
        lightness = 50 + (i % 2) * 5
        colors.append(hsl_to_hex(hue, saturation, lightness))
    return colors

def generate_palette_by_scheme(scheme, wheel_colors, seed):
    rand = seeded_random(seed + "palette")
    base_index = int(rand * 12)
    indices = []
    
    if scheme == "complementary":
        indices = [base_index, (base_index + 6) % 12]
        indices.extend([(base_index + 1) % 12, (base_index + 5) % 12, (base_index + 7) % 12])
    elif scheme == "triadic":
        indices = [base_index, (base_index + 4) % 12, (base_index + 8) % 12]
        indices.extend([(base_index + 2) % 12, (base_index + 6) % 12])
    elif scheme == "analogous":
        indices = [(base_index - 2 + 12) % 12, (base_index - 1 + 12) % 12, base_index,
                   (base_index + 1) % 12, (base_index + 2) % 12]
    elif scheme == "split-complementary":
        indices = [base_index, (base_index + 5) % 12, (base_index + 7) % 12]
        indices.extend([(base_index + 1) % 12, (base_index + 6) % 12])
    elif scheme == "tetradic":
        indices = [base_index, (base_index + 3) % 12, (base_index + 6) % 12, (base_index + 9) % 12]
        indices.append((base_index + 1) % 12)
    else:
        indices = [0, 2, 4, 6, 8]
    
    indices = indices[:5]
    
    for i in range(len(indices) - 1, 0, -1):
        j = int(seeded_random(seed + "shuffle" + str(i)) * (i + 1))
        indices[i], indices[j] = indices[j], indices[i]
    
    return [wheel_colors[i] for i in indices]

def get_daily_puzzle(date_str=None):
    if not date_str:
        date_str = datetime.utcnow().strftime('%Y-%m-%d')
    
    rand = seeded_random(date_str)
    rand3 = seeded_random(date_str + "scheme")
    hue_shift = int(rand * 360)
    wheel_colors = generate_color_wheel(hue_shift)
    
    schemes = ["complementary", "triadic", "analogous", "split-complementary", "tetradic"]
    scheme_index = int(rand3 * len(schemes))
    scheme = schemes[scheme_index]
    
    palette = generate_palette_by_scheme(scheme, wheel_colors, date_str)
    
    return {
        'date': date_str,
        'hueShift': hue_shift,
        'scheme': scheme,
        'palette': palette,
        'wheelColors': wheel_colors
    }

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/puzzle')
def get_puzzle():
    puzzle = get_daily_puzzle()
    return jsonify(puzzle)

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    password_hash = generate_password_hash(password)
    
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute('INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id, email',
                           (email, password_hash))
                user = cur.fetchone()
            conn.commit()
        
        session.permanent = True
        session['user_id'] = user['id']
        session['email'] = user['email']
        return jsonify({'success': True, 'email': user['email']})
    except psycopg2.IntegrityError:
        return jsonify({'error': 'Email already registered'}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT id, email, player_name, password_hash FROM users WHERE email = %s',
                       (email,))
            user = cur.fetchone()
    
    if user and user['password_hash'] and check_password_hash(user['password_hash'], password):
        session.permanent = True
        session['user_id'] = user['id']
        session['email'] = user['email']
        return jsonify({'success': True, 'email': user['email'], 'playerName': user['player_name']})
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/auth/status')
def auth_status():
    if 'user_id' in session:
        return jsonify({'loggedIn': True, 'email': session.get('email')})
    return jsonify({'loggedIn': False})

@app.route('/api/palettes', methods=['GET'])
@login_required
def get_palettes():
    user_id = session['user_id']
    
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT date, colors, scheme, guess_count, won, is_favorite, saved_at
                FROM palettes WHERE user_id = %s ORDER BY saved_at DESC
            ''', (user_id,))
            palettes = cur.fetchall()
    
    return jsonify([{
        'date': p['date'],
        'colors': p['colors'],
        'scheme': p['scheme'],
        'guessCount': p['guess_count'],
        'won': p['won'],
        'isFavorite': p['is_favorite'],
        'savedAt': p['saved_at'].isoformat() if p['saved_at'] else None
    } for p in palettes])

@app.route('/api/palettes', methods=['POST'])
@login_required
def save_palette():
    user_id = session['user_id']
    data = request.get_json()
    
    palette_date = data.get('date')
    colors = data.get('colors', [])
    scheme = data.get('scheme', '')
    guess_count = data.get('guessCount', 5)
    won = data.get('won', False)
    
    if not palette_date or not colors:
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute('''
                    INSERT INTO palettes (user_id, date, colors, scheme, guess_count, won)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (user_id, date) DO NOTHING
                    RETURNING id
                ''', (user_id, palette_date, colors, scheme, guess_count, won))
                result = cur.fetchone()
            conn.commit()
        
        return jsonify({'success': True, 'new': result is not None})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/palettes/<date>/favorite', methods=['POST'])
@login_required
def toggle_favorite(date):
    user_id = session['user_id']
    
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute('''
                UPDATE palettes SET is_favorite = NOT is_favorite
                WHERE user_id = %s AND date = %s
                RETURNING is_favorite
            ''', (user_id, date))
            result = cur.fetchone()
        conn.commit()
    
    if result:
        return jsonify({'success': True, 'isFavorite': result['is_favorite']})
    return jsonify({'error': 'Palette not found'}), 404

@app.route('/api/daily-stats')
def get_daily_stats():
    today = request.args.get('date')
    if not today:
        today = datetime.utcnow().strftime('%Y-%m-%d')
    
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT COUNT(*) as player_count FROM palettes WHERE date = %s
            ''', (today,))
            count_result = cur.fetchone()
            player_count = count_result['player_count'] if count_result else 0
            
            cur.execute('''
                SELECT MIN(guess_count) as best FROM palettes 
                WHERE date = %s AND won = TRUE
            ''', (today,))
            best_count_result = cur.fetchone()
            best_guess = best_count_result['best'] if best_count_result else None
            
            best_players = []
            if best_guess:
                cur.execute('''
                    SELECT u.player_name, u.email
                    FROM palettes p
                    JOIN users u ON p.user_id = u.id
                    WHERE p.date = %s AND p.won = TRUE AND p.guess_count = %s
                    ORDER BY p.saved_at ASC
                ''', (today, best_guess))
                results = cur.fetchall()
                best_players = [r['player_name'] or r['email'].split('@')[0] for r in results]
    
    return jsonify({
        'playerCount': player_count,
        'bestPlayers': best_players,
        'bestGuess': best_guess
    })

@app.route('/api/profile', methods=['GET'])
@login_required
def get_profile():
    user_id = session['user_id']
    
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT email, player_name FROM users WHERE id = %s', (user_id,))
            user = cur.fetchone()
    
    return jsonify({
        'email': user['email'],
        'playerName': user['player_name']
    })

@app.route('/api/profile', methods=['PUT'])
@login_required
def update_profile():
    user_id = session['user_id']
    data = request.get_json()
    player_name = data.get('playerName', '').strip() or None
    
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute('UPDATE users SET player_name = %s WHERE id = %s', (player_name, user_id))
        conn.commit()
    
    return jsonify({'success': True})

@app.route('/api/auth/google-available')
def google_auth_available():
    return jsonify({'available': google_client is not None})

@app.route('/google_login')
def google_login():
    if not google_client:
        return jsonify({'error': 'Google login not configured'}), 500
    
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]
    
    redirect_uri = request.base_url.replace("http://", "https://") + "/callback"
    
    request_uri = google_client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=redirect_uri,
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)

@app.route('/google_login/callback')
def google_callback():
    if not google_client:
        return jsonify({'error': 'Google login not configured'}), 500
    
    code = request.args.get("code")
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    token_endpoint = google_provider_cfg["token_endpoint"]
    
    token_url, headers, body = google_client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url.replace("http://", "https://"),
        redirect_url=request.base_url.replace("http://", "https://"),
        code=code,
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )
    
    if token_response.status_code != 200:
        return redirect('/?error=google_auth_failed')
    
    try:
        google_client.parse_request_body_response(json.dumps(token_response.json()))
    except Exception:
        return redirect('/?error=google_auth_failed')
    
    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = google_client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)
    
    if userinfo_response.status_code != 200:
        return redirect('/?error=google_auth_failed')
    
    userinfo = userinfo_response.json()
    if not userinfo.get("email_verified"):
        return redirect('/?error=email_not_verified')
    
    google_sub = userinfo["sub"]
    users_email = userinfo["email"].lower()
    users_name = userinfo.get("given_name", users_email.split('@')[0])
    
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT id, email FROM users WHERE google_sub = %s', (google_sub,))
            user = cur.fetchone()
            
            if not user:
                cur.execute('SELECT id, email FROM users WHERE email = %s', (users_email,))
                user = cur.fetchone()
                if user:
                    cur.execute('UPDATE users SET google_sub = %s WHERE id = %s', (google_sub, user['id']))
                else:
                    cur.execute(
                        'INSERT INTO users (email, google_sub, player_name) VALUES (%s, %s, %s) RETURNING id, email',
                        (users_email, google_sub, users_name)
                    )
                    user = cur.fetchone()
        conn.commit()
    
    session.permanent = True
    session['user_id'] = user['id']
    session['email'] = user['email']
    
    return redirect('/')

with app.app_context():
    init_db()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
