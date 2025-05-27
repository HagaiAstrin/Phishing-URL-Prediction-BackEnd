const phishing_keywords = ['login', 'update', 'verify', 'secure', 'account', 'bank'];
const shortening_services = ['bit.ly', 'goo.gl', 'tinyurl.com', 'ow.ly', 't.co'];
const brand_keywords = ['paypal', 'google', 'facebook', 'apple', 'microsoft'];
const suspicious_tlds = ['tk', 'ml', 'ga', 'cf', 'gq'];


export const FEATURE_NAMES = [
  "length_url", "length_hostname", "nb_dots", "nb_hyphens", "nb_at", "nb_qm", "nb_eq", "nb_underscore", "nb_percent", "nb_slash",
  "nb_www", "nb_com", "https_token", "ratio_digits_url", "ratio_digits_host", "tld_in_subdomain", "prefix_suffix", "random_domain",
  "shortening_service", "nb_redirection", "length_words_raw", "char_repeat", "shortest_words_raw", "shortest_word_host",
  "shortest_word_path", "longest_words_raw", "longest_word_host", "longest_word_path", "avg_words_raw", "avg_word_host",
  "avg_word_path", "phish_hints", "domain_in_brand", "suspecious_tld"
];



function safeUrl(url) {
  try {
    return new URL(url);
  } catch (e) {
    return null;
  }
}

function getHostname(url) {
  const u = safeUrl(url);
  return u ? u.hostname : '';
}

function getPath(url) {
  const u = safeUrl(url);
  return u ? u.pathname : '';
}

function countOccurrences(str, char) {
  return str.split(char).length - 1;
}

function extractWords(text) {
  return text.split(/[^a-zA-Z0-9]+/).filter(Boolean);
}

function digitRatio(str) {
  const digits = (str.match(/\d/g) || []).length;
  return digits / (str.length || 1);
}

export function length_url(url) {
  return url.length;
}

export function length_hostname(url) {
  return getHostname(url).length;
}

export function nb_dots(url) {
  return countOccurrences(getHostname(url), '.');
}

export function nb_hyphens(url) {
  return countOccurrences(url, '-');
}

export function nb_at(url) {
  return countOccurrences(url, '@');
}

export function nb_qm(url) {
  return countOccurrences(url, '?');
}

export function nb_eq(url) {
  return countOccurrences(url, '=');
}

export function nb_underscore(url) {
  return countOccurrences(url, '_');
}

export function nb_percent(url) {
  return countOccurrences(url, '%');
}

export function nb_slash(url) {
  return countOccurrences(url, '/');
}

export function nb_www(url) {
  return countOccurrences(url, 'www');
}

export function nb_com(url) {
  return countOccurrences(url, '.com');
}

export function https_token(url) {
  return url.toLowerCase().includes('https') ? 1 : 0;
}

export function ratio_digits_url(url) {
  return digitRatio(url);
}

export function ratio_digits_host(url) {
  return digitRatio(getHostname(url));
}

export function tld_in_subdomain(url) {
  const host = getHostname(url);
  return suspicious_tlds.some(tld => host.split('.')[0].includes(tld)) ? 1 : 0;
}

export function prefix_suffix(url) {
  const host = getHostname(url);
  return host.includes('-') ? 1 : 0;
}

export function random_domain(url) {
  const host = getHostname(url).split('.')[0];
  return /^[a-z0-9]{10,}$/.test(host) ? 1 : 0;
}

export function shortening_service(url) {
  const host = getHostname(url);
  return shortening_services.some(service => host.includes(service)) ? 1 : 0;
}

export function nb_redirection(url) {
  return countOccurrences(url, '//') > 1 ? 1 : 0;
}

export function length_words_raw(url) {
  return extractWords(url).join('').length;
}

export function char_repeat(url) {
  const match = url.match(/(.)\1+/g);
  return match ? Math.max(...match.map(m => m.length)) : 0;
}

function wordStats(words) {
  const lengths = words.map(w => w.length);
  return {
    shortest: lengths.length ? Math.min(...lengths) : 0,
    longest: lengths.length ? Math.max(...lengths) : 0,
    average: lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0
  };
}

export function shortest_words_raw(url) {
  return wordStats(extractWords(url)).shortest;
}

export function shortest_word_host(url) {
  return wordStats(extractWords(getHostname(url))).shortest;
}

export function shortest_word_path(url) {
  return wordStats(extractWords(getPath(url))).shortest;
}

export function longest_words_raw(url) {
  return wordStats(extractWords(url)).longest;
}

export function longest_word_host(url) {
  return wordStats(extractWords(getHostname(url))).longest;
}

export function longest_word_path(url) {
  return wordStats(extractWords(getPath(url))).longest;
}

export function avg_words_raw(url) {
  return wordStats(extractWords(url)).average;
}

export function avg_word_host(url) {
  return wordStats(extractWords(getHostname(url))).average;
}

export function avg_word_path(url) {
  return wordStats(extractWords(getPath(url))).average;
}

export function phish_hints(url) {
  const lurl = url.toLowerCase();
  return phishing_keywords.filter(k => lurl.includes(k)).length;
}

export function domain_in_brand(url) {
  const host = getHostname(url).toLowerCase();
  return brand_keywords.some(b => host.includes(b)) ? 1 : 0;
}

export function suspecious_tld(url) {
  const parts = getHostname(url).split('.');
  const tld = parts[parts.length - 1];
  return suspicious_tlds.includes(tld) ? 1 : 0;
}

export function extractAllFeatures(url) {
  const featureMap = {
    length_url: length_url(url),
    length_hostname: length_hostname(url),
    nb_dots: nb_dots(url),
    nb_hyphens: nb_hyphens(url),
    nb_at: nb_at(url),
    nb_qm: nb_qm(url),
    nb_eq: nb_eq(url),
    nb_underscore: nb_underscore(url),
    nb_percent: nb_percent(url),
    nb_slash: nb_slash(url),
    nb_www: nb_www(url),
    nb_com: nb_com(url),
    https_token: https_token(url),
    ratio_digits_url: ratio_digits_url(url),
    ratio_digits_host: ratio_digits_host(url),
    tld_in_subdomain: tld_in_subdomain(url),
    prefix_suffix: prefix_suffix(url),
    random_domain: random_domain(url),
    shortening_service: shortening_service(url),
    nb_redirection: nb_redirection(url),
    length_words_raw: length_words_raw(url),
    char_repeat: char_repeat(url),
    shortest_words_raw: shortest_words_raw(url),
    shortest_word_host: shortest_word_host(url),
    shortest_word_path: shortest_word_path(url),
    longest_words_raw: longest_words_raw(url),
    longest_word_host: longest_word_host(url),
    longest_word_path: longest_word_path(url),
    avg_words_raw: avg_words_raw(url),
    avg_word_host: avg_word_host(url),
    avg_word_path: avg_word_path(url),
    phish_hints: phish_hints(url),
    domain_in_brand: domain_in_brand(url),
    suspecious_tld: suspecious_tld(url)
  };

  return FEATURE_NAMES.map(name => featureMap[name]);  // return ordered list
}