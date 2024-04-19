import { HTMLProps } from 'react'
import styles from './styles.module.css'


export function TextArea({...props}: HTMLProps<HTMLTextAreaElement>){

  return (
    <textarea className={styles.textarea} {...props}>

    </textarea>
  )
}