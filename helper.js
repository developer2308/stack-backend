function getOffset(currentPage = 1, listPerPage) {
  return (currentPage - 1) * [listPerPage];
}

function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

const removeHtmlTags = (body) => {
  let result = body || "";
  const removePatterns = [/<\/?[^>]+(>|$)/gi];
  removePatterns.forEach((pattern) => {
    result = result.replace(pattern, "");
  });

  return result;
};

const splitToWords = (query) => {
  return query.split(" ").filter((w) => !!w);
};

const bodyForList = (body, query) => {
  let result = removeHtmlTags(body);
  const paragrahps = result.split(/\n/);

  const words = splitToWords(query);
  let matchedPara = paragrahps[0];

  for (let i = 0; i < words.length; i++) {
    const matched = paragrahps.find((para) =>
      para.toLowerCase().includes(words[i].toLowerCase())
    );
    if (matched) {
      matchedPara = matched;
      break;
    }
  }

  return matchedPara;
};

module.exports = {
  getOffset,
  emptyOrRows,
  removeHtmlTags,
  bodyForList,
  splitToWords,
};
