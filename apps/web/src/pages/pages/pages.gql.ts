import { gql } from '@apollo/client';

export const GET_PAGES = gql`
  query GetPages {
    pages {
      id
      title
        slug
        projectId
        siteId
        site {
          id
          name
          domain
          host
          slug
          type
          projectId
        }
        mobileAppId
        mobileApp {
          id
          name
          description
          type
          projectId
        }
        sections {
          id
          name
          parentId
          pageId
          type
        }
    }
  }
`;

export const GET_PAGE_DETAIL = gql`
  query GetPageDetail($id: Int!) {
    page(id: $id) {
        id
        title
        slug
        projectId
        siteId
        site {
            id
            name
            domain
            host
            slug
            type
            projectId
        }
        mobileAppId
        mobileApp {
            id
            name
            description
            type
            projectId
        }
        metaTitle
        metaDescription
        keywords
        ogImage
        sections {
            id
            name
            type
            order
            columnLayout
            containerType
            parentId
            subSections {
                id
                name
                type
                order
                columnLayout
                containerType
                parentId
            }
        }
        subPages {
            id
            title
            slug
        }
        createdAt
        updatedAt
    }
  }
`;

export const CREATE_SECTION = gql`
  mutation CreateSection($input: CreateSectionInput!) {
    createSection(input: $input) {
      id
      name
      type
      order
      columnLayout
      containerType
      parentId
      pageId
    }
  }
`;

export const UPDATE_SECTION = gql`
  mutation UpdateSection($id: Int!, $input: UpdateSectionInput!) {
    updateSection(id: $id, input: $input) {
      id
      name
      type
      order
      columnLayout
      containerType
      parentId
      pageId
    }
  }
`;

export const DELETE_SECTION = gql`
  mutation DeleteSection($id: Int!) {
    deleteSection(id: $id) {
      id
    }
  }
`;

// export const CREATE_PAGE = gql`
//   mutation CreatePage($input: CreatePageInput!) {
//     createPage(input: $input) {
//       title
//       slug
//       projectId
//       sections? {
//
//   }
//     }
//   }
// `;
//
// export const UPDATE_SITE = gql`
//   mutation UpdateSite($id: Int!, $input: UpdateSiteInput!) {
//     updateSite(id: $id, input: $input) {
//       id
//       name
//       domain
//       slug
//     }
//   }
// `;

export const DELETE_SITE = gql`
  mutation DeletePage($id: Int!) {
    deletePage(id: $id) {
      id
    }
  }
`;
