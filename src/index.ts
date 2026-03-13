import express from 'express'
import 'dotenv/config'
import { Request, Response, NextFunction } from 'express'
import { db } from './firebase'
import { admin } from './firebaseAdmin'
import { setDoc, getDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors({
  origin: 'https://codeway-config-website.onrender.com'
}))

const validateFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ msg: "Unauthorized" })
    return
  }
  const token = authHeader.split('Bearer ')[1]
  try {
    await admin.auth().verifyIdToken(token)
    next()
  } catch {
    res.status(401).json({ msg: "Invalid token" })
  }
}

const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey !== process.env.API_KEY) {
    res.status(401).json({ msg: "Invalid API key" })
    return
  }
  next()
}

app.post("/panel/create/:country", validateFirebaseToken, async (req: Request, res: Response) => {
  await setDoc(doc(db, "Config List", req.params.country), req.body)
  res.json({ msg: "Country config created" })
})

app.get("/panel/read/:country", validateFirebaseToken, async (req: Request, res: Response) => {
  const docSnap = await getDoc(doc(db, "Config List", req.params.country))
  if (docSnap.exists()) {
    res.json({ id: docSnap.id, ...docSnap.data() })
  } else {
    res.status(404).json({ msg: "Country not found" })
  }
})

app.put("/panel/update/:country", validateFirebaseToken, async (req: Request, res: Response) => {
  await updateDoc(doc(db, "Config List", req.params.country), req.body)
  res.json({ msg: "Parameters Updated" })
})

app.delete("/panel/delete/:country", validateFirebaseToken, async (req: Request, res: Response) => {
  await deleteDoc(doc(db, "Config List", req.params.country))
  res.json({ msg: "Country config deleted" })
})


app.get("/config/:country", validateApiKey, async (req: Request, res: Response) => {
  const country = req.params.country.toUpperCase()
  let docSnap = await getDoc(doc(db, "Config List", country))

  if (!docSnap.exists()) {
    docSnap = await getDoc(doc(db, "Config List", "TR"))
  }

  if (docSnap.exists()) {
    res.json(docSnap.data())
  } else {
    res.status(404).json({ msg: "Config not found" })
  }
})

app.listen(4000, () => console.log("Up & Running on 4000"))