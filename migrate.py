import re

def process_files():
    input_file = "C:\\Users\\Gabriel\\Downloads\\index.html"
    
    with open(input_file, 'r', encoding='utf-8') as f:
        html = f.read()

    # Extract base layout
    head_nav_match = re.search(r'(<!DOCTYPE html>.*?</nav>)', html, re.DOTALL)
    footer_match = re.search(r'(<footer>.*?</html>)', html, re.DOTALL)
    
    if not head_nav_match or not footer_match:
        print("Failed to find base layout")
        return
        
    head_nav = head_nav_match.group(1)
    # Fix the links in nav to go back to index.html if needed
    head_nav = head_nav.replace('href="#modul"', 'href="index.html#modul"')
    head_nav = head_nav.replace('href="#database"', 'href="index.html#database"')
    head_nav = head_nav.replace('href="#dss"', 'href="index.html#dss"')
    head_nav = head_nav.replace('href="#ai"', 'href="index.html#ai"')
    head_nav = head_nav.replace('href="#library"', 'href="index.html#library"')
    head_nav = head_nav.replace('href="#"', 'href="index.html"')
    # Restore the first # since it was matched by href="#"
    head_nav = head_nav.replace('<a class="nav-logo" href="index.html">', '<a class="nav-logo" href="index.html">')

    footer = footer_match.group(1)

    # We need to extract the modals
    # 1. Antropometri (calculatorModal)
    calc_modal_match = re.search(r'<!-- CALCULATOR MODAL -->.*?<div class="modal-content[^>]*>(.*?)</div>\s*</div>\s*<!-- KLINIS SCAN MODAL -->', html, re.DOTALL)
    
    # 2. Klinis (klinisScanModal)
    klinis_modal_match = re.search(r'<!-- KLINIS SCAN MODAL -->.*?<div class="modal-content[^>]*>(.*?)</div>\s*</div>\s*<!-- DIETARY ASSESSMENT MODAL -->', html, re.DOTALL)
    
    # 3. Dietary (dietaryModal)
    dietary_modal_match = re.search(r'<!-- DIETARY ASSESSMENT MODAL -->.*?<div class="modal-content[^>]*>(.*?)</div>\s*</div>\s*<script>', html, re.DOTALL)
    
    # Extract JS
    calc_js_match = re.search(r'(// ===== CALCULATOR MODAL LOGIC =====.*?)(?=\n  // ===== KLINIS LIVE SCAN LOGIC =====)', html, re.DOTALL)
    klinis_js_match = re.search(r'(// ===== KLINIS LIVE SCAN LOGIC =====.*?)(?=\n  // ===== DIETARY ASSESSMENT LOGIC =====)', html, re.DOTALL)
    dietary_js_match = re.search(r'(// ===== DIETARY ASSESSMENT LOGIC =====.*?)</script>', html, re.DOTALL)

    # Create HTML content for new pages
    def create_page(title, content_html, js_logic):
        # We wrap the content in a main container so it looks like a page, not a popup
        # Remove the close button
        content_html = re.sub(r'<button class="modal-close".*?</button>', '', content_html, flags=re.DOTALL)
        
        # Remove .active class requirement from JS, we just run the init functions if needed
        # and remove any document.body.style.overflow stuff
        js_logic = re.sub(r'\w+\.classList\.(add|remove)\(\'active\'\);', '', js_logic)
        js_logic = re.sub(r'document\.body\.style\.overflow\s*=\s*[^;]+;', '', js_logic)
        
        page = head_nav + f"""
<main style="padding: 100px 20px 60px; max-width: 900px; margin: 0 auto; min-height: 80vh;">
    <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid var(--gray-200);">
        {content_html}
    </div>
</main>
<script>
    // Include the intersection observer for reveals if needed
    const observer = new IntersectionObserver((entries) => {{
        entries.forEach((e, i) => {{
            if (e.isIntersecting) {{
                setTimeout(() => e.target.classList.add('visible'), i * 80);
            }}
        }});
    }}, {{ threshold: 0.1 }});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    {js_logic}
</script>
""" + footer
        return page

    # Save Antropometri
    if calc_modal_match and calc_js_match:
        with open('C:\\Users\\Gabriel\\Downloads\\antropometri.html', 'w', encoding='utf-8') as f:
            js = calc_js_match.group(1)
            # automatically call calculateNutrition on load
            js += "\n  window.addEventListener('DOMContentLoaded', () => { calculateNutrition(); });"
            f.write(create_page("Antropometri", calc_modal_match.group(1), js))
            print("Created antropometri.html")

    # Save Klinis
    if klinis_modal_match and klinis_js_match:
        with open('C:\\Users\\Gabriel\\Downloads\\klinis.html', 'w', encoding='utf-8') as f:
            js = klinis_js_match.group(1)
            js += "\n  window.addEventListener('DOMContentLoaded', () => { initKlinisCamera(); });"
            f.write(create_page("Klinis Live Scan", klinis_modal_match.group(1), js))
            print("Created klinis.html")

    # Save Dietary
    if dietary_modal_match and dietary_js_match:
        with open('C:\\Users\\Gabriel\\Downloads\\dietary.html', 'w', encoding='utf-8') as f:
            js = dietary_js_match.group(1)
            f.write(create_page("Dietary Assessment", dietary_modal_match.group(1), js))
            print("Created dietary.html")

    # Now we need to modify index.html
    # Remove modals
    html = re.sub(r'<!-- CALCULATOR MODAL -->.*?</div>\s*</div>\s*</div>', '', html, flags=re.DOTALL)
    html = re.sub(r'<!-- KLINIS SCAN MODAL -->.*?</div>\s*</div>\s*</div>', '', html, flags=re.DOTALL)
    html = re.sub(r'<!-- DIETARY ASSESSMENT MODAL -->.*?</div>\s*</div>\s*</div>', '', html, flags=re.DOTALL)
    
    # Remove JS
    html = re.sub(r'// ===== CALCULATOR MODAL LOGIC =====.*?(?=</script>)', '', html, flags=re.DOTALL)
    
    # Change onclicks to hrefs
    html = re.sub(r'<div class="dss-card reveal" onclick="openCalculatorModal\(\)" style="cursor: pointer;([^"]*)">', r'<a href="antropometri.html" class="dss-card reveal" style="text-decoration:none;color:inherit;cursor:pointer;\1">', html)
    html = re.sub(r'<div class="dss-card reveal" onclick="openKlinisModal\(\)" style="cursor: pointer;([^"]*)">', r'<a href="klinis.html" class="dss-card reveal" style="text-decoration:none;color:inherit;cursor:pointer;\1">', html)
    html = re.sub(r'<div class="dss-card reveal" onclick="openDietaryModal\(\)" style="cursor: pointer;([^"]*)">', r'<a href="dietary.html" class="dss-card reveal" style="text-decoration:none;color:inherit;cursor:pointer;\1">', html)
    
    # Don't forget to close the </a> tag for these cards
    html = re.sub(r'(<a href="antropometri.html".*?</div>)\s*</div>', r'\1\n      </a>', html, flags=re.DOTALL)
    html = re.sub(r'(<a href="klinis.html".*?</div>)\s*</div>', r'\1\n      </a>', html, flags=re.DOTALL)
    html = re.sub(r'(<a href="dietary.html".*?</div>)\s*</div>', r'\1\n      </a>', html, flags=re.DOTALL)
    
    with open('C:\\Users\\Gabriel\\Downloads\\index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated index.html")

if __name__ == "__main__":
    process_files()
