# Donations Widget

A customizable donation widget that can be embedded on any website as a custom HTML element. Built with Preact and designed to integrate seamlessly with payment gateways.

## Quick Start

### 1. Include the Widget Script

Add the widget script to your HTML page:

```html
<script type="module" src="path/to/donations-widget.js"></script>
```

### 2. Add the Widget Element

Place the donations widget in your HTML:

```html
<donations-widget 
  pg-url="https://your-payment-gateway.com"
  currency="USD"
  lang="en"
  contribution-options="[50,100,200]"
  total-contribution="25000"
  total-contributors="150"
  recurrent="true">
</donations-widget>
```

### 3. Style the Widget (Optional)

```css
.donations-widget {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}
```

## Configuration Parameters

The widget accepts the following parameters as HTML attributes. All attribute names should be in kebab-case (e.g., `pg-url`, `total-contribution`).

### Required Parameters

| Attribute | Type | Description |
|-----------|------|-------------|
| `pg-url` | `string` | **Required.** The URL of your payment gateway endpoint. This is where donation requests will be sent. |

### Optional Parameters

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `start-date` | `Date` | - | The campaign start date. When provided, displays "since [date]" information in the widget header. |
| `total-contribution` | `number` | - | Total amount raised so far. Displays prominently in the widget header to show campaign progress. |
| `total-contributors` | `number` | - | Number of people who have contributed. Shows social proof in the widget header. |
| `currency` | `string` | `"USD"` | Currency for donations. Supported values: `"CZK"`, `"USD"`, `"EUR"` |
| `contribution-options` | `number[]` | Varies by language | Array of preset donation amounts. Example: `[50,100,200]`. Users can also enter custom amounts. |
| `lang` | `string` | Browser default | Interface language. Supported values: `"cs"`, `"cs-cz"`, `"en"`, `"en-us"`, `"en-eu"` |
| `recurrent` | `boolean` | `false` | Whether to show recurring donation options (monthly vs one-time). |

### Currency Support

The widget supports three currencies with automatic formatting:

- **CZK** (Czech Koruna) - Symbol: Kč
- **USD** (US Dollar) - Symbol: $  
- **EUR** (Euro) - Symbol: €

### Language Support

The widget includes built-in translations for:

- **Czech** (`cs`, `cs-cz`) - Full localization including currency formatting
- **English** (`en`, `en-us`, `en-eu`) - Multiple regional variants with appropriate defaults

### Default Contribution Options

When `contribution-options` is not specified, the widget uses these defaults based on language:

- **Czech (cs-cz)**: `[500, 1000, 5000]` (CZK)
- **English (en-us)**: `[50, 100, 200]` (USD)  
- **English (en-eu)**: `[50, 100, 200]` (EUR)

## Examples

### Basic Widget

```html
<donations-widget pg-url="https://api.example.com/payments"></donations-widget>
```

### Campaign Progress Widget

```html
<donations-widget 
  pg-url="https://api.example.com/payments"
  total-contribution="25000"
  total-contributors="150"
  start-date="2024-01-01"
  currency="USD">
</donations-widget>
```

### Localized Widget with Custom Amounts

```html
<donations-widget 
  pg-url="https://api.example.com/payments"
  lang="cs-cz"
  currency="CZK"
  contribution-options="[200,500,1000,2000]"
  recurrent="true">
</donations-widget>
```

### Complete Widget Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Support Our Cause</title>
  <style>
    .donations-widget {
      width: 100%;
      max-width: 500px;
      margin: 2rem auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div>
    <h1>Help Us Make a Difference</h1>
    <donations-widget 
      pg-url="https://your-payment-gateway.com/api"
      total-contribution="15750"
      total-contributors="89"
      start-date="2024-10-01"
      currency="USD"
      contribution-options="[25,50,100,250]"
      lang="en-us"
      recurrent="true"
      class="donations-widget">
    </donations-widget>
  </div>
  
  <script type="module" src="https://your-cdn.com/donations-widget.js"></script>
</body>
</html>
```

## Features

- **Two-step donation process**: Amount selection → Donor information
- **Multiple payment options**: Support for various payment methods
- **Responsive design**: Works on desktop and mobile devices
- **Accessibility**: Built with screen readers and keyboard navigation in mind
- **Customizable styling**: Use CSS to match your website's design
- **Multiple languages**: Built-in Czech and English translations
- **Recurring donations**: Optional monthly donation support
- **Campaign tracking**: Display total raised and contributor count
- **Custom amounts**: Users can enter any donation amount
- **Form validation**: Comprehensive client-side validation
- **Company donations**: Special flow for corporate donations with tax receipt requirements

## Development

This project uses Nx for development and build management.

### Build the Widget

```sh
npx nx build sandbox
```

### Run Development Server

```sh
npx nx serve sandbox
```

### Run Tests

```sh
npx nx test sandbox
```

## Browser Support

The widget supports all modern browsers that support Custom Elements v1:
- Chrome 67+
- Firefox 63+
- Safari 13.1+
- Edge 79+

For older browsers, you may need to include a Custom Elements polyfill.
