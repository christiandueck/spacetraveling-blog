import Header from '../components/Header';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from "@prismicio/client"
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns';

import { FiCalendar, FiUser } from "react-icons/fi";

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState(postsPagination.results);

  async function handleLoadMore() {
    if (nextPage) {
      await fetch(nextPage)
        .then(response => response.json())
        .then(response => {
          setNextPage(response.next_page);
          const newPosts = response.results.map(post => {
            return {
              uid: post.uid,
              first_publication_date: format(
                new Date(post.first_publication_date),
                'd LLL YYY',
                { locale: ptBR }
              ),
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author,
              },
            };
          });
          setPosts(posts.concat(newPosts));
        });
    }
    console.log(posts);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>spacetraveling.</title>
      </Head>
      <Header />

      <main>
        {posts.map(post => (
          <div className={styles.post} key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
              </a>
            </Link>
            <p>{post.data.subtitle}</p>
            <div className={styles.info}>
              <span><FiCalendar />{post.first_publication_date}</span>
              <span><FiUser />{post.data.author}</span>
            </div>
          </div>
        ))}

        {nextPage && (
          <strong onClick={handleLoadMore}>
            Carregar mais posts
          </strong>
        )}
      </main>

    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'd LLL YYY',
        { locale: ptBR }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};