// Stored in pieces and reversed so that scrapers reading the source never see the address or number whole.
const MAIL = ['em.', 'notorp', '@neyugn', '_irtimid'];
const TEL = ['37', '72', '744', '77', '14+'];

const rev = (s) => [...s].reverse().join('');

export function revealContact() {
  const email = MAIL.map(rev).reverse().join('');
  const parts = TEL.map(rev).reverse();
  return { email, phone: parts.join(' '), phoneHref: 'tel:' + parts.join('') };
}
