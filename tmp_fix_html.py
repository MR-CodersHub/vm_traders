import os
import re

# Define the directory
directory = r'c:\Users\dines\OneDrive\Desktop\e-commerce-site-main - Copy'

# Define the replacement for the <head> section
# We want to remove background.css and add CDN links and api.js if missing.

def fix_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove background.css
    content = re.sub(r'<link rel="stylesheet" href="assets/css/background.css">', '', content)
    
    # 2. Add Font Awesome and Lucide if missing
    if 'font-awesome/6.4.0' not in content:
        cdn_links = '    <!-- Icon Libraries -->\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n    <script src="https://unpkg.com/lucide@latest"></script>'
        # Insert before </head> or after style.css
        if '<link rel="stylesheet" href="assets/css/style.css">' in content:
            content = content.replace('<link rel="stylesheet" href="assets/css/style.css">', '<link rel="stylesheet" href="assets/css/style.css">\n' + cdn_links)
        else:
            content = content.replace('</head>', cdn_links + '\n</head>')

    # 3. Add api.js if missing
    if 'assets/js/api.js' not in content:
        api_js = '    <script src="assets/js/api.js"></script>'
        content = content.replace('</head>', api_js + '\n</head>')

    # 4. Fix specific incorrect Font Awesome classes
    replacements = {
        'fa-currency-circle-dollar': 'fa-circle-dollar-to-slot',
        'fa-timer': 'fa-clock',
        'fa-bag-shopping-open': 'fa-bag-shopping',
        'fa-drop': 'fa-droplet',
        'fa-brandy': 'fa-glass-cheers',
        'fa-lock-key': 'fa-lock',
        'fa-hand-heart': 'fa-hand-holding-heart',
        'fa-user-circle': 'fa-circle-user',
        'fa-magnifying-glass': 'fa-magnifying-glass', # ensure it's correct
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)

    # 5. Remove duplicate icons.js if any
    content = re.sub(r'<script src="assets/js/icons.js"></script>\s*<script src="assets/js/icons.js"></script>', '<script src="assets/js/icons.js"></script>', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Process all HTML files
for filename in os.listdir(directory):
    if filename.endswith('.html'):
        fix_html_file(os.path.join(directory, filename))

print("Fixed all HTML files.")
