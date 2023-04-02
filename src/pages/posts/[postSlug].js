import Head from "next/head";
import Link from "next/link";
import { gql } from "@apollo/client";

import { getApolloClient } from "../../lib/apollo-client";

export default function Post({ post, site }) {
  return (
    <div className="">
      <Head>
        <title>{post.seo.title}</title>
        <meta
          name="description"
          content={`Read more about ${post.title} on ${site.title}`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="">
        <h1 className="">{post.translation.title}</h1>

        <div className="">
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: post.translation.content,
            }}
          />
        </div>

        <p className="">
          <Link href="/">
            &lt; Back To Home
          </Link>
        </p>
      </main>
    </div>
  );
}

export async function getStaticProps({ params, locale }) {
  const { postSlug } = params;
  const language = locale.toUpperCase();

  const apolloClient = getApolloClient();

  const data = await apolloClient.query({
    query: gql`
      query PostBySlug($slug: String!, $language: LanguageCodeEnum!) {
        generalSettings {
          title
        }
        postBy(slug: $slug) {
          id
          content
          title
          slug
          translation(language: $language) {
            id
            slug
            content
            title
            language {
              locale
              slug
            }
          }
          seo {
            title
          }
        }
      }
    `,
    variables: {
      slug: params.postSlug,
      language,
    },
  });

  let post = data?.data.postBy;

  const site = {
    ...data?.data.generalSettings,
  };

  return {
    props: {
      post,
      language,
      path: `/posts/${post.slug}`,
      site,
    },
    revalidate: 10,
  };
}

export async function getStaticPaths({ locales }) {
  const apolloClient = getApolloClient();

  const data = await apolloClient.query({
    query: gql`
      {
        posts(first: 10000) {
          edges {
            node {
              id
              title
              slug
            }
          }
        }
      }
    `,
  });

  const posts = data?.data.posts.edges.map(({ node }) => node);

  const paths = posts.map(({ slug }) => {
    return {
      params: {
        postSlug: slug,
      },
    };
  });

  return {
    paths: [
      ...paths,
      ...paths.flatMap((path) => {
        return locales.map((locale) => {
          return {
            ...path,
            locale,
          };
        });
      }),
    ],
    paths: [],
    fallback: "blocking",
  };
}