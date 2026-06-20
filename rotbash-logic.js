/* ============================================================
   Rotate and Bash — DOM-free core (shared with index.html + test.html)
   Pure transform/scoring functions. No document.* access.
   Behavior is preserved verbatim from the original inline code +
   genanal.js — do not "fix" scoring/order here (see plan: improvement
   ideas A/C/E cover that separately).
   ============================================================ */

// ── Transforms ───────────────────────────────────────────────────────

function Atbash(inputText, AlphabetText) {
   var output = "";
   var revBet = AlphabetText.split("").reverse().join("");
   for (let i = 0; i < inputText.length; i++) {
      var c = inputText.substr(i, 1);
      var x = AlphabetText.indexOf(c);
      if (x >= 0) {
         output += revBet.substr(x, 1);
      } else {
         output += c;
      }
   }
   return (output);
}

function RotX(inputText, n, AlphabetText) {
   var output = "";
   for (let i = 0; i < inputText.length; i++) {
      var c = inputText.substr(i, 1);
      var x = AlphabetText.indexOf(c);
      if (x >= 0) {
         x = (x + n) % AlphabetText.length;
         output += AlphabetText.substr(x, 1);
      } else {
         output += c;
      }
   }
   return (output);
}

// ── Sequence aggregator ──────────────────────────────────────────────
// Returns the ordered list of candidates exactly as the original
// OnAction -> AddOutput/ShowRotations produced them:
//   For each enabled base variant: the base itself, then rot-1..rot-(len-1).
// opts: { toUpper, toAtbash, toReverse }

function pushVariant(out, baseDesc, text, AlphabetText) {
   out.push({ desc: baseDesc, text: text });
   for (let i = 1; i < AlphabetText.length; i++) {
      out.push({ desc: baseDesc + "+rot-" + i.toString(), text: RotX(text, i, AlphabetText) });
   }
}

function generateSequences(inputText, AlphabetText, opts) {
   opts = opts || {};
   if (opts.toUpper) inputText = inputText.toUpperCase();

   var out = [];

   // Normal (always included)
   pushVariant(out, "Normal", inputText, AlphabetText);

   if (opts.toReverse) {
      var rev = inputText.split("").reverse().join("");
      pushVariant(out, "Reversed", rev, AlphabetText);
   }

   if (opts.toAtbash) {
      var atb = Atbash(inputText, AlphabetText);
      pushVariant(out, "Atbash", atb, AlphabetText);
   }

   if (opts.toAtbash && opts.toReverse) {
      var atbRev = Atbash(inputText.split("").reverse().join(""), AlphabetText);
      pushVariant(out, "Atbash+reversed", atbRev, AlphabetText);
   }

   return out;
}

// ── English-likeness scoring (auto-solver) ───────────────────────────
// Letter-frequency fit via chi-squared distance to English. LOWER is
// more English-like. All RotBash candidates share the same length, so
// raw chi-squared values are directly comparable across rotations.

var EN_FREQ_PCT = {
   A: 8.17, B: 1.49, C: 2.78, D: 4.25, E: 12.70, F: 2.23, G: 2.02,
   H: 6.09, I: 6.97, J: 0.15, K: 0.77, L: 4.03, M: 2.41, N: 6.75,
   O: 7.51, P: 1.93, Q: 0.10, R: 5.99, S: 6.33, T: 9.06, U: 2.76,
   V: 0.98, W: 2.36, X: 0.15, Y: 1.97, Z: 0.07
};

function englishChiSquared(text) {
   text = (text || "").toUpperCase();
   var counts = {}, N = 0;
   for (let i = 0; i < text.length; i++) {
      var c = text.charAt(i);
      if (c >= "A" && c <= "Z") { counts[c] = (counts[c] || 0) + 1; N++; }
   }
   if (N === 0) return Infinity; // nothing to score
   var chi = 0;
   for (var letter in EN_FREQ_PCT) {
      var expected = N * EN_FREQ_PCT[letter] / 100;
      var observed = counts[letter] || 0;
      chi += (observed - expected) * (observed - expected) / expected;
   }
   return chi;
}

// ── Pattern detection (repeated substrings) ──────────────────────────

function GetPatternsInString(sInput) {
   sInput = sInput.toUpperCase(); // UCASE compare
   sInput = sInput.replace(/\n/g, "");
   var output = [];
   var nMin = 4;

   for (let j = 0; j < sInput.length - nMin; j++) {
      var subPat = sInput.substr(j, nMin);
      var foundAt = sInput.indexOf(subPat, j + nMin);
      if (foundAt > 0) {
         var i = 0;
         while (sInput.substr(j + nMin + i, 1) == sInput.substr(foundAt + nMin + i, 1) && (j + nMin + i) < foundAt) i++;
         output.push(sInput.substr(j, nMin + i));
         j += nMin + i - 1;
      }
   }

   return (output);
}

// ── Keyword scanning ─────────────────────────────────────────────────

function GetKeywordsArrayInString(sInput, aKeywords) {
   var output = [];
   for (let j = 0; j < sInput.length; j++) {
      for (let i = 0; i < aKeywords.length; i++) {
         if (sInput.substr(j, aKeywords[i].length) == aKeywords[i]) {
            //Found the exact word
            output.push(aKeywords[i]);
            j = j + aKeywords[i].length - 1; // skip letters in sentence
            break;
         }
      }
   }
   return (output);
}

function GetKeywordsInString(sInput, sKeywords) {
   var aKeywords = sKeywords.split(",");

   sInput = sInput.replace(/\n/g, "");
   sInput = sInput.toUpperCase(); // UCASE compare
   for (let i = 0; i < aKeywords.length; i++) {
      aKeywords[i] = aKeywords[i].trim().toUpperCase(); //Kill spaces and UCASE
   }
   var output = GetKeywordsArrayInString(sInput, aKeywords);

   return (output);
}

// ── Dual export (browser + Node) ─────────────────────────────────────
if (typeof module !== "undefined" && module.exports) {
   module.exports = {
      Atbash, RotX, generateSequences, englishChiSquared,
      GetPatternsInString, GetKeywordsArrayInString, GetKeywordsInString
   };
}
if (typeof globalThis !== "undefined") {
   Object.assign(globalThis, {
      Atbash, RotX, generateSequences, englishChiSquared,
      GetPatternsInString, GetKeywordsArrayInString, GetKeywordsInString
   });
}
