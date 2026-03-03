const ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function bech32Polymod(values) {
  let chk = 1;
  for (let i = 0; i < values.length; i++) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ values[i];
    if (b & 1) chk ^= 0x3b6a57b2;
    if (b & 2) chk ^= 0x26508e6d;
    if (b & 4) chk ^= 0x1ea119fa;
    if (b & 8) chk ^= 0x3d4233dd;
    if (b & 16) chk ^= 0x2a1462b3;
  }
  return chk;
}

function bech32Encode(prefix, data) {
  // Convert 8-bit bytes to 5-bit groups
  const converted = [];
  let acc = 0, bits = 0;
  for (let i = 0; i < data.length; i++) {
    acc = (acc << 8) | data[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      converted.push((acc >> bits) & 31);
    }
  }
  if (bits > 0) converted.push((acc << (5 - bits)) & 31);

  // Expand HRP for checksum
  const expand = [];
  for (let i = 0; i < prefix.length; i++) expand.push(prefix.charCodeAt(i) >> 5);
  expand.push(0);
  for (let i = 0; i < prefix.length; i++) expand.push(prefix.charCodeAt(i) & 31);

  const all = expand.concat(converted).concat([0, 0, 0, 0, 0, 0]);
  const polymod = bech32Polymod(all) ^ 1;
  const checksum = [];
  for (let i = 0; i < 6; i++) checksum.push((polymod >> (5 * (5 - i))) & 31);

  const result = converted.concat(checksum);
  let out = prefix + "1";
  for (let i = 0; i < result.length; i++) out += ALPHABET[result[i]];
  return out;
}

export function evmToRai(evmAddr) {
  if (!evmAddr || !evmAddr.startsWith("0x")) return "";
  const hex = evmAddr.slice(2);
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bech32Encode("rai", bytes);
}

export function raiToEvm(raiAddr) {
  if (!raiAddr || !raiAddr.startsWith("rai1")) return "";
  const data = raiAddr.slice(4);
  const values = [];
  for (let i = 0; i < data.length - 6; i++) {
    values.push(ALPHABET.indexOf(data[i]));
  }
  const bytes = [];
  let acc = 0, bits = 0;
  for (let i = 0; i < values.length; i++) {
    acc = (acc << 5) | values[i];
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      bytes.push((acc >> bits) & 255);
    }
  }
  return "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function shortenAddress(addr) {
  if (!addr) return "";
  if (addr.startsWith("0x")) return addr.slice(0, 6) + "..." + addr.slice(-4);
  return addr.slice(0, 10) + "..." + addr.slice(-6);
}
