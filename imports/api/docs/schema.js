const typeDefinitions = `
schema {
  query: Names
}

type Names {
  fullNames(offset: Int, limit: Int): Results
}

type Results {
  count: Int
  rows: [Name]
}

type Name {
  id: String
  name: String
}
`;

export default [typeDefinitions];
