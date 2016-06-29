import { Names } from './sql-connector';

const resolvers = {
  Names: {
    fullNames(root, args) {
      return Names.findAndCountAll({ offset: args.offset, limit: args.limit });
    },
  },
  Results: {
    rows(root, args) {
      return root.rows;
    },
  },
};

export default resolvers;
