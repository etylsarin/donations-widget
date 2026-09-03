export enum Lang {
  CS = 'cs',
  CS_CZ = 'cs-cz',
  EN = 'en',
  EN_US = 'en-us',
  EN_EU = 'en-eu',
}

// The languages the widget actually renders in. `Lang.CS` and `Lang.EN` are accepted
// as input (a bare `<html lang="cs">` is common) but always resolve to one of these.
export type ResolvedLang = Lang.CS_CZ | Lang.EN_US | Lang.EN_EU;

export enum Currency {
  CZK = 'CZK',
  USD = 'USD',
  EUR = 'EUR',
}

export enum CurrencySymbol {
  CZK = 'Kč',
  USD = '$',
  EUR = '€',
}

export enum CurrencyCode {
  CZK = '203',
  USD = '840',
  EUR = '978',
}

export enum Status {
  NEW = 'NEW',
  BUSY = 'BUSY',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export enum Stage {
  DONATION = 'DONATION',
  DONOR = 'DONOR',
}

export enum Routes {
  REQUEST = '/integration/hh_request_payment',
  CONFIRMATION = '/integration/hh_confirm_payment',
}
