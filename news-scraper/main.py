from selenium import webdriver
import time
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

newsHref = []
# Configure Chrome options
options = Options()
options.headless = True  # Enable headless mode
options.add_argument("--window-size=1920,1200")  # Set the window size

# Initialize the Chrome driver
driver = webdriver.Chrome()

# Navigate to the URL
driver.get('https://finance.yahoo.com/quote/AAPL/latest-news/')

# Function to scroll to the bottom
def scroll_to_bottom(driver):
    old_position = driver.execute_script("return window.pageYOffset;")
    
    # # Retrieve the page source
    # html = driver.page_source

    # # Parse the HTML with BeautifulSoup
    # soup = BeautifulSoup(html, 'html.parser')

    # # Find all 'tr' elements with class 'athing' which contain the news titles
    # list = soup.select('.stream-item.story-item')

    # # Loop through each title and print it
    # for l in list:
    #     # Find the <a> tag within the 'titleline' span inside a 'td' with class 'title'
    #     href_link = l.find('section', class_='container').find('a')
    #     href = href_link.get('href')
    #     newsHref.append(href)

    # print(len(newsHref))
    # if len(newsHref) >= 1000:
    #     return

    while True:
        print("SCROLL")
        # Execute JavaScript to scroll down
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        # Wait for the page to load
        time.sleep(10)  # This delay will depend on the connection speed and server response time
        new_position = driver.execute_script("return window.pageYOffset;")
        if new_position == old_position:
            break  # Exit the loop if the page hasn't scrolled, meaning end of page
        old_position = new_position

scroll_to_bottom(driver)

# It's a good practice to close the browser when done
driver.quit()

with open("../result-news/aapl-link.txt", "w") as txt_file:
    for line in newsHref:
        txt_file.write(line + "\n")