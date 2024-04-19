import { Inter } from "next/font/google";
import styles from '../styles/home.module.css'
import Image from "next/image";
import heroImg from '../../public/assets/hero.png'
import { GetStaticProps } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConection";

const inter = Inter({ subsets: ["latin"] });

interface HomeProps {
  posts: number
  comments: number
}

export default function Home({posts, comments}: HomeProps) {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image className={styles.hero} src={heroImg} alt="Logo Tarefas" priority/>
        </div>

        <h1 className={styles.title}>Sistema feito para você organizar <br/> seus estudos e tarefas</h1>
        <div className={styles.contentInfo}>
          <section className={styles.box} >
            <span>+{posts} posts</span>
          </section>
          <section className={styles.box} >
            <span>+{comments} Comments</span>
          </section>
        </div>

      </main>
    </div>
  );
}



export const getStaticProps: GetStaticProps = async() =>{

  const postsRef = collection(db, 'tarefas')
  const commentsRef = collection(db, 'comments')

  const postSnapshot = await getDocs(postsRef)
  const commentsSnapshot = await getDocs(commentsRef)


  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentsSnapshot.size || 0
    },
    revalidate: 60
  }
}