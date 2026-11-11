// Stored in pieces and reversed so that scrapers reading the source never see the address whole.
// Email only: the phone number is not published.
const MAIL = ['em.', 'notorp', '@neyugn', '_irtimid'];

const rev = (s) => [...s].reverse().join('');

export function revealContact() {
  return { email: MAIL.map(rev).reverse().join('') };
}
