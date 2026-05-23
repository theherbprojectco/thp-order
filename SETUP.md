# OrderFlow Google Sheets Backend and Deployment

## What I Need From You

1. A Google account that will own the master Google Sheet.
2. The final product list, or permission to start with columns:
   `product_name`, `sku`, `price`, `active`.
3. Two role PINs:
   - Admin PIN
   - Team PIN
4. A GitHub account/repository for GitHub Pages deployment.
5. The app name/link you want to share with the team.

## Google Sheet Structure

Create a Google Sheet with these tabs:

- `Orders`
- `Products`
- `Expenses`

The Apps Script in `apps-script/Code.gs` will create missing headers automatically.

You can also import the starter CSV files from `google-sheet-template/`:

- `Orders.csv`
- `Products.csv`
- `Expenses.csv`

In Google Sheets, create one tab per CSV file and use `File > Import > Upload > Replace current sheet`.

### Products Tab

Use these columns:

```text
product_name, sku, price, active
```

Example rows:

```text
Rose Silk Scrunchie Set, SCR-ROSE, 649, Yes
Linen Tote, TOTE-LINEN, 1899, Yes
Launch PR Box, PR-BOX, 2200, Yes
```

Only products where `active` is not `No` appear in the app dropdown.

### Expenses Tab

Use these columns:

```text
expense_id, expense_date, expense_type, amount, paid_by, paid_to, payment_method, related_order_id, notes, created_by, last_updated
```

Expense types currently available in the app:

```text
Raw Material, Shipping, Ad Marketing, Packaging, Tools, Other
```

Team members can add expenses for raw materials, shipping, ads, packaging, tools, and other costs. These rows sync to the `Expenses` tab.

## Apps Script Setup

1. Open your Google Sheet.
2. Go to `Extensions > Apps Script`.
3. Paste the full contents of `apps-script/Code.gs`.
4. Save the project.
5. Click `Deploy > New deployment`.
6. Choose type `Web app`.
7. Set:
   - Execute as: `Me`
   - Who has access: `Anyone`
8. Deploy and copy the Web App URL.

## Connect The App

Open `config.js` and set:

```js
window.ORDERFLOW_CONFIG = {
  apiUrl: "YOUR_APPS_SCRIPT_WEB_APP_URL",
  adminPin: "CHANGE_THIS_ADMIN_PIN",
  teamPin: "CHANGE_THIS_TEAM_PIN",
};
```

Do not keep the demo PINs before sharing the app.

After editing `config.js`, redeploy or re-upload the app files to GitHub Pages.

## GitHub Pages Deployment

1. Create a new GitHub repo.
2. Upload these files/folders:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `config.js`
   - `manifest.webmanifest`
   - `sw.js`
   - `icon.svg`
   - `apps-script/Code.gs`
   - `SETUP.md`
3. In GitHub, go to `Settings > Pages`.
4. Set source to `Deploy from a branch`.
5. Choose branch `main` and folder `/root`.
6. Save.

GitHub will give you a URL like:

```text
https://yourname.github.io/orderflow/
```

Share that link with team members. They open it on phone, sign in with their name, role, and PIN, then use it like an app.

## Team Usage

Admin can:

- Add orders
- Edit order details
- Delete orders
- Export CSV
- View metrics

Team can:

- View orders
- Update status
- Add courier and tracking
- Add notes
- Add expenses

Products are managed in the `Products` Google Sheet tab. When a product is added there, users tap `Sync` in the app and it appears in the product dropdown.

Expenses are stored in the `Expenses` Google Sheet tab. Admin can export expenses as CSV from the app, or download the sheet directly from Google Sheets.

## Notes

This is simple PIN security. It is fine for early internal use, but not strong authentication. When the business depends on it daily, move to Google login, Firebase Auth, or Supabase Auth.
