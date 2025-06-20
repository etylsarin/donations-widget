export enum Lang {
  CS = 'cs',
  CS_CZ = 'cs-cz',
  EN = 'en',
  EN_US = 'en-us',
  EN_EU = 'en-eu',
}

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

export type LangWithRegion = Exclude<Lang, Lang.CS | Lang.EN>
