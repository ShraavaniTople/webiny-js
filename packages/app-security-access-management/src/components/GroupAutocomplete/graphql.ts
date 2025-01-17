import gql from "graphql-tag";

export const LIST_GROUPS: any = gql`
    query listGroups {
        security {
            groups: listGroups {
                data {
                    id
                    slug
                    name
                    description
                    createdOn
                }
            }
        }
    }
`;
