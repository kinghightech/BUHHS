/**
 * Known address → home value lookup table.
 * Keys are canonical address strings (lowercase matching is applied at lookup time).
 * Values are home prices in USD.
 *
 * When a user types an address that matches one of these entries,
 * the home value field is auto-populated.
 */
export const ADDRESS_VALUES = {
  '7 Windham Ln':        1_595_000,
  '17 Erindale Dr':        599_000,
  '525 Lindell Ave':       799_000,
  '557 Happy Ct':          349_900,
  '14 Louisa Ct':          979_000,
  '12894 Falling Water Rd': 674_900,
  '15 Glenarden Road':     800_000,
  '51 Reservoir Rd':     1_399_999,
  '17 Willet Dr':          953_000,
  '52 Odonnell Ave':       957_000,
  '9 Sandpiper Dr':        900_300,
  '41 Hill St':             499_900,
  '559 Merriam Ave':        469_900,
  '50 Blackstone St':       449_000,
  '1130 NW 42nd Ct':        479_999,
  '4136 NW 13th Ave':       435_000,
  '1000 Jason Rd':          560_000,
}

function normalize(s) {
  return s.toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * Look up a home value by address string.
 * Performs case-insensitive, partial matching so a full address like
 * "7 Windham Ln, Shrewsbury, MA 01545" still matches "7 Windham Ln".
 * Returns the home value (number) or null if no match.
 */
export function lookupAddressValue(input) {
  if (!input) return null
  const normInput = normalize(input)
  for (const [addr, value] of Object.entries(ADDRESS_VALUES)) {
    if (normInput.includes(normalize(addr))) {
      return value
    }
  }
  return null
}
