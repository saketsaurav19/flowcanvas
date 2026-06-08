from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000/")

    # Wait for the page to load
    page.wait_for_timeout(2000)

    # Click Auto Layout button
    # Wait for Auto Layout to finish
    # Take screenshot
    page.screenshot(path="screenshot.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
