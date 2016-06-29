// this component brings in Apollo GraphQL data
export const mapQueriesToProps = ({ ownProps, state }) => (
  {
    getNames: {
      query: gql`
        query allNames($offset:Int!,$limit:Int!){
          fullNames(offset:$offset,limit:$limit){
            count
            rows {
              id
              name
            }
          }
        }
      `,
      variables: {
        offset: ownProps.offset,
        limit: ownProps.limit,
      },
      forceFetch: false,
      returnPartialData: false,
    },
  }
);
