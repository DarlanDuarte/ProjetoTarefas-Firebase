import Head from 'next/head'
import styles from './styles.module.css'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { TextArea } from '../../components/textarea'
import {FiShare2} from 'react-icons/fi'
import {FaTrash} from 'react-icons/fa'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { db } from '../../services/firebaseConection'
import {addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import Link from 'next/link'

export interface HomeProps{
  user: {
    email: string
  }
}

export interface TaskProps {
  id: string
  created: Date
  public: boolean
  tarefas: string
  user: string  
}


export default function Dashboard({user}: HomeProps){
  const [input, setInput] = useState('')
  const [publicTask, setPublicTask] = useState(false)
  const [tasks, setTasks] = useState<TaskProps[]>([])


  useEffect(() =>{
    async function loadTarefas(){
      const tarefasRef = collection(db, 'tarefas')
      const q = query(
        tarefasRef,
        orderBy("created", 'desc'),
        where('user', '==', user?.email)

      )

      onSnapshot(q, (snapshot) =>{
        let lista = [] as TaskProps[]

        snapshot.forEach((doc) =>{
          lista.push({
            id: doc.id,
            tarefas: doc.data().tarefas,
            created: doc.data().created,
            user: doc.data().user,
            public: doc.data().public
          })
        })

        setTasks(lista)

      })
    }

    loadTarefas()
  }, [user?.email])


  function handleChangePublic(e: ChangeEvent<HTMLInputElement>){
    console.log(e.target.checked)
    setPublicTask(e.target.checked)
  }

  async function handleRegisterTask(e: FormEvent){
    e.preventDefault()

    if(input === '')return

    try{
      await addDoc(collection(db, 'tarefas'), {
        tarefas: input,
        created: new Date(),
        user: user?.email,
        public: publicTask
      })

      setInput('')
      setPublicTask(false)

    }catch(error){
      console.log(error)
    }

  }

  async function handleShare(id: string){
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`
    )

    alert(`URL copiada com sucesso!`)
  }

  async function handleDeleteTask(id: string){
    const docRef = doc(db, 'tarefas', id)
    await deleteDoc(docRef)

  }


  return(
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>
            <form onSubmit={handleRegisterTask}>
              <TextArea placeholder='Digite qual sua tarefa...' 
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              />
              <div className={styles.checkboxArea}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox} 
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa publica?</label>
              </div>

              <button className={styles.button} type='submit'>Registrar</button>

            </form>
          </div>
        </section>

        <section className={styles.taskContainer}>

          <h1>Minhas tarefas</h1>

          {tasks.map((item, index) =>(
            <article key={item.id} className={styles.task}>
            {item.public && (
              <div className={styles.tagContainer}>
              <label className={styles.tag}>PUBLICO</label>
              <button className={styles.shareButton} onClick={() => handleShare(item.id)}>
                <FiShare2  size={22} color={'#3183ff'}/>
              </button>
            </div>
            )}

            <div className={styles.taskContent}>
              {item.public ? (
                <Link href={`/task/${item.id}`}>
                  <p>{item.tarefas}</p>
                </Link>
              ): (
                <p>{item.tarefas}</p>
              )}
              
              <button onClick={() => handleDeleteTask(item.id)} className={styles.trashButton}>
                <FaTrash size={24} color='#ea3140' />
              </button>

            </div>
          </article>
          ))}




        </section>

      </main>
    </div>
  )

}



export const getServerSideProps : GetServerSideProps = async({req}) =>{
  const session = await getSession({req})

  if(!session?.user){
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }



  return {
    props: {
      user:{
        email: session?.user?.email
      }
    }
  }
}