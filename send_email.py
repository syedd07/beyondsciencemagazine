import requests
def send_ebook(recipient_email, subject, text, pdf_file_path):
    return requests.post(
        "https://api.mailgun.net/v3/mg.beyondsciencemagazine.studio/messages",
        auth=("api", "ec8be3ea97a18b76b66875b4da3b320b-2b91eb47-a9242247"),
        files=[("attachment", (pdf_file_path, open(pdf_file_path, "rb").read()))],
        data={"from": "E-Books <e-books@mg.beyondsciencemagazine.studio>",
              "to": recipient_email,
              "subject": subject,
              "text": text})

# Example usage:
send_ebook(
    recipient_email="user@example.com",
    subject="Your Requested E-Book",
    text="Thank you for requesting our e-book! Please find the attached PDF.",
    pdf_file_path="path/to/your/JAN-edition.pdf"
)
