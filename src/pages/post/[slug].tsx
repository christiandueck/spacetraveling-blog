import Head from 'next/head';
import Header from '../../components/Header';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';
import { format } from 'date-fns';
import { RichText } from "prismic-dom";

import { FiCalendar, FiUser, FiClock } from "react-icons/fi";

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <div className={commonStyles.container}>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>

      <Header />

      <main className={styles.post}>
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt={post.data.title} />
        </div>

        <h1>{post.data.title}</h1>

        <div className={commonStyles.info}>
          <span><FiCalendar />{post.first_publication_date}</span>
          <span><FiUser />{post.data.author}</span>
          <span><FiClock />1 min</span>
        </div>

        {post.data.content.map(content => (
          <section>
            <h2>{content.heading}</h2>
            <div className={styles.content}>
              {content.body}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient()
  const response = await prismic.getByUID('post', String(slug), {})
  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'd LLL YYY',
      { locale: ptBR }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [RichText.asHtml(content.body)]
        }
      }),
    }
  }

  return {
    props: {
      post
    },
    redirect: 60 * 30
  }
}
