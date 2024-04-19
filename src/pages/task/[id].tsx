import { ChangeEvent, FormEvent, useState } from 'react'
import { useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import styles from './styles.module.css'
import { db } from '../../services/firebaseConection'
import { TextArea } from '../../components/textarea'
import { 
  doc, 
  getDoc, 
  addDoc, 
  query,
  where,
  collection,
  getDocs,
  deleteDoc
  
} from 'firebase/firestore'
import { FaTrash } from 'react-icons/fa'

interface taskProps {
  item: {
    user: string
    public: boolean
    tarefas: string
    created: string
    taskId: string
  }
  allcomments: CommentsProps[]
}

interface CommentsProps{
  id: string
  comment: string
  name: string
  taskId: string
  user: string
}

export default function Task({item, allcomments}: taskProps){
  const {data: session, status} = useSession()

  const [input, setInput] = useState('')
  const [comment, setComment] = useState<CommentsProps[]>(allcomments || [])


  async function handleComment(event: FormEvent){
    event.preventDefault()

    if(input === '')return;
    
    if(!session?.user?.email || !session?.user?.name)return;

    try{
      const docRef = await addDoc(collection(db, 'comments'), {
        comment: input,
        name: session?.user?.name,
        user: session?.user?.email,
        created: new Date(),
        taskId: item.taskId

      })

      const data: CommentsProps = {
        id: docRef.id,
        name: session?.user?.name,
        user: session?.user?.email,
        comment: input,
        taskId: item.taskId

      }

      setComment((oldItems) => [...oldItems, data])

      setInput('')

    }catch(error){
      console.log(error)
    }

  }

  async function handleDeleteComment(id: string){

    try{

      const docRef = doc(db, 'comments', id)
      await deleteDoc(docRef)

      const deleteComment = comment.filter((item) => item.id !== id)

      setComment(deleteComment)

    }catch(error){
      console.log(error)
    }
  }


  return(
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Tarefa</h1>

        <article className={styles.task}>
          <p>{item.tarefas}</p>
        </article>

      </main>

      <section className={styles.comentsContainer}>
        <h2>Escreva seu comentário</h2>

        <form onSubmit={handleComment}>
          <TextArea 
            placeholder='Escreva seu comentário...' 
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
          />
          <button disabled={!session?.user} className={styles.button}>Enviar Comentário</button>
        </form>


      </section>


      <section className={styles.comentsContainer}>
        <h2>Todos comentários</h2>

        {comment.length === 0 && (
          <span>Nenhum comentário foi feito...</span>
        )}

        {comment.map((item) =>(
          <article key={item.id} className={styles.comment}>
            <div className={styles.headComment}>
              <label className={styles.commentsLabel}>{item.name}</label>
              {item.user === session?.user?.email && (
                <button onClick={() => handleDeleteComment(item.id)} className={styles.buttonTrash}>
                  <FaTrash size={18} color={'#EA3140'} />
                </button>
              )}
            </div>

            <p>{item.comment}</p>
          </article>
        ))}

      </section>

    </div>
  )

}


export const getServerSideProps: GetServerSideProps = async ({params}) =>{
  const id = params?.id as string

  const docRef = doc(db, 'tarefas', id)

  const q = query(collection(db, 'comments'), where('taskId', '==', id))
  const snapshotComments = await getDocs(q)


  let allComments: CommentsProps[] = []

  snapshotComments.forEach((doc) =>{
    allComments.push({
      id: doc.id,
      comment: doc.data()?.comment,
      name: doc.data()?.name,
      user: doc.data()?.user,
      taskId: doc.data()?.taskId

    })
  })

  console.log(allComments)

  const snapshot = await getDoc(docRef)

  if(snapshot.data() === undefined){
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }


  if(!snapshot.data()?.public){{
    return {
      redirect:{
        destination: '/',
        permanent: false
      }
    }
  }}

  //console.log(snapshot.data())

  const milisegundos = snapshot.data()?.created?.seconds * 1000

  const tasks = {
    user: snapshot.data()?.user,
    public: snapshot.data()?.public,
    tarefas: snapshot.data()?.tarefas,
    created: new Date(milisegundos).toLocaleDateString(),
    taskId: id
  }

  console.log(tasks)

  return {
    props: {
      item: tasks,
      allcomments: allComments
    }
  }
}