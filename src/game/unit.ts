  export const JSON_with_bigInt = (data) => {
  return JSON.stringify(data, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value // return everything else unchanged
  );
};
