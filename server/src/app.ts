import express from 'express'
import bodyParser from 'body-parser'
const app = express()
const port = 4000

// parse application/json
app.use(bodyParser.json())

app.post('/api/authorize', (req, res) => {
    console.log(req.body)
    res.json({ yourtoken: `sir!`, originalBody: req.body })
})

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`)
})
