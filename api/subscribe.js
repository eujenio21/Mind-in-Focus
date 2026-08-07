/*
  API segura para cadastrar leads no Brevo
  Caminho:
  /api/subscribe.js

  Variável da Vercel:
  BREVO_API_KEY

  Lista Brevo:
  ID 4
*/

const BREVO_API_URL = "https://api.brevo.com/v3/contacts";
const BREVO_LIST_ID = 4;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
    String(email || "").trim()
  );
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      success: false,
      message: "Method not allowed."
    });
  }

  try {

    const {
      name = "",
      email = "",
      website = ""
    } = req.body || {};

    // Honeypot contra spam
    if (website) {
      return res.status(200).json({
        success: true
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid name."
      });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email."
      });
    }

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "BREVO_API_KEY not configured."
      });
    }

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        email: cleanEmail,
        attributes: {
          FIRSTNAME: cleanName
        },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {

      console.error(result);

      return res.status(500).json({
        success: false,
        message: "Brevo error."
      });

    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });

  }

}