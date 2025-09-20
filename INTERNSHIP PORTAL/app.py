from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, make_response
import csv
import os
import json
from werkzeug.security import generate_password_hash, check_password_hash
from flask_babel import Babel

# app.py (top)
from text_exact import recommend_jobs, load_candidate_from_json



app = Flask(__name__)
app.secret_key = 'replace_with_a_secure_secret_key'

USER_CSV = 'users.csv'
PROFILE_FILE = 'profiles.json'

LANGUAGES = ['en', 'hi', 'ml']  # Supported languages
app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'

def get_locale():
    lang = request.cookies.get('user_lang')
    if lang in LANGUAGES:
        return lang
    return 'en'

# ✅ Initialize Babel with locale_selector
babel = Babel(app, locale_selector=get_locale)


def initialize_csv():
    if not os.path.exists(USER_CSV):
        with open(USER_CSV, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['user', 'password_plain', 'password_encrypted'])

def load_users():
    users = {}
    if os.path.exists(USER_CSV):
        with open(USER_CSV, newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                users[row['user']] = row['password_encrypted']
    return users

def save_user(username, password_plain):
    initialize_csv()
    password_encrypted = generate_password_hash(password_plain)
    with open(USER_CSV, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([username, password_plain, password_encrypted])

def load_profiles():
    if not os.path.exists(PROFILE_FILE):
        return {}
    with open(PROFILE_FILE, 'r') as f:
        return json.load(f)

def save_profiles(profiles):
    with open(PROFILE_FILE, 'w') as f:
        json.dump(profiles, f, indent=4)

@app.route('/')
def language_select():
    return render_template('language_select.html', languages=LANGUAGES)

@app.route('/set_language/<lang_code>')
def set_language(lang_code):
    if lang_code not in LANGUAGES:
        lang_code = 'en'
    resp = make_response(redirect(url_for('login')))
    resp.set_cookie('user_lang', lang_code, max_age=60*60*24*365)
    return resp

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        if not username or not password:
            flash('Please enter username and password', 'error')
            return redirect(url_for('login'))

        users = load_users()
        if username in users and check_password_hash(users[username], password):
            session['username'] = username
            return redirect(url_for('main_menu'))
        else:
            flash('Invalid username or password', 'error')
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()

        if not username or not password or not confirm_password:
            flash('Please fill all fields', 'error')
            return redirect(url_for('register'))

        if password != confirm_password:
            flash('Passwords do not match', 'error')
            return redirect(url_for('register'))

        users = load_users()
        if username in users:
            flash('Username already exists', 'error')
            return redirect(url_for('register'))

        save_user(username, password)
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/main_menu')
def main_menu():
    if 'username' not in session:
        flash('Please login first', 'error')
        return redirect(url_for('login'))
    return render_template('menu.html', username=session['username'])

@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('Logged out successfully', 'success')
    return redirect(url_for('login'))

@app.route('/profile')
def profile():
    if 'username' not in session:
        flash('Please login first', 'error')
        return redirect(url_for('login'))
    return render_template('profile.html', username=session['username'])

@app.route('/profile_data', methods=['GET', 'POST'])
def profile_data():
    if 'username' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    username = session['username']
    profiles = load_profiles()

    if request.method == 'GET':
        # Return profile if exists, else empty object
        return jsonify(profiles.get(username, {}))

    if request.method == 'POST':
        data = request.json or {}
        # Merge new data with existing
        profiles[username] = {**profiles.get(username, {}), **data}
        save_profiles(profiles)
        return jsonify({'status': 'success', 'data': profiles[username]})

    
@app.route('/feedback')
def feedback():
    return render_template('feedback.html')

@app.route('/government_internships')
def government_internships():
    return render_template('govintern[1].html', username=session.get('username'))

@app.route('/applications')
def applications():
    # Optionally, fetch user-specific applications here to pass to template
    return render_template('application_management.html', username=session.get('username'))

@app.route('/assessment')
def assessment():
    # Optionally, fetch tests from database to pass to template
    return render_template('assessment_test.html', username=session.get('username'))

@app.route('/private_internships')
def private_internships():
    # optionally pass internships data here from DB
    return render_template('private_internship.html', username=session.get('username'))

@app.route('/recommendations', methods=['GET'])
def recommendations():
    if 'username' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    profiles = load_profiles()
    username = session['username']
    profile = profiles.get(username, {})

    # Build candidate dict from profile
    candidate = load_candidate_from_json(username, role="data_analyst")
    if not candidate:
        return jsonify({'error': 'Profile not found'}), 404

    # Get recommendations (top 10)
    try:
        recs = recommend_jobs(candidate, top_k=10)
    except Exception as e:
        return jsonify({'error': 'Recommendation failed', 'message': str(e)}), 500

    return jsonify({'recommendations': recs})



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
    