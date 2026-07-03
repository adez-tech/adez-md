# ADEZ-MD WhatsApp Bot 🚀

<p align="center">
  <img src="https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/main/1000234278.png" alt="ADEZ-MD Banner" width="500"/>
</p>

Welcome to **ADEZ-MD**, a multi-device WhatsApp bot designed for seamless performance, easy command handling, and automated utility.

---

## 🛠️ Features
* **Multi-Device Support:** Stays connected even when your phone is offline.
* **Database Sync:** Optional integration with Supabase for cloud session storage.
* **Modular Commands:** Easily expandable command structure (e.g., custom `menu`).

---

## 🚀 Quick Deployment

### Deploy to Render
1. Fork this repository to your GitHub account.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your forked repository.
4. Set the **Build Command** to: `npm install`
5. Set the **Start Command** to: `node index.js`

---

## ⚙️ Environment Variables

Configure these keys in your deployment platform's **Environment Variables** tab to get the bot running perfectly:

| Variable Name | Description | Example / Format |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | Your Supabase Anon/Public API Key | *Must strictly start with a lowercase `e`* (`eyJhbGci...`) |
| `PORT` | The port the web server runs on | `10000` |

> ⚠️ **Important Note on Supabase Keys:** Ensure your `SUPABASE_KEY` is completely accurate. Web tokens (JWT) copy-pasted with an accidental capital **E** at the beginning will fail authentication. It must start with a lowercase **`e`**.

---

## 📲 How to Pair Your Account

1. Once deployed, monitor your platform's server log stream.
2. If no prior session is found, the console will output a unique **Pairing Code** or a **QR Code**.
3. Open WhatsApp on your phone -> **Linked Devices** -> **Link a Device**.
4. Scan the QR code or enter the pairing code to bring the bot online.

---

## 🛠️ Database Troubleshooting

If your logs throw an error like:
`❌ [Session Download Failed]: invalid input syntax for type bigint: "ADEZ-MD-SESSION"`

This means your Supabase table schema uses a `bigint` data type where the bot expects `text`. To resolve this:
* **Option A:** Modify your Supabase column type for the session ID from `bigint` to `text`.
* **Option B:** Remove the `SUPABASE_URL` and `SUPABASE_KEY` variables to let the bot save its session locally instead.
* 
