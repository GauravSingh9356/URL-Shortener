const express=require('express')

const app=express();
const shortUrl=require('./models/shortUrl')

const bodyParser=require('body-parser')
const cors=require('cors')

const PORT=process.env.PORT || 3000
const mongoose=require('mongoose')
const db=require('./config/keys').mongoURI;
mongoose.connect(db, { useNewUrlParser: true })
.then(()=> console.log('Connected'))
.catch(err => console.log(err))


app.use(bodyParser.json())
app.use(cors())


app.get('/new/:urlToShorten(*)', (req, res, next)=>{
    var  {urlToShorten}=req.params;

    var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    var regex=expression;

    if(regex.test(urlToShorten)===true){
        var short=Math.floor(Math.random()*100).toString()

        var data=new shortUrl(
            {
                originalUrl: urlToShorten,
                shorterUrl: short
            }
        )
        data.save(err=>{
            if(err)
            return res.send('Error saving to database')
        })
    return res.json(data)
    }
    var data=new shortUrl({
        originalUrl: 'URL does not match with standard format',
        shorterUrl:'Invalid URL!'
    })
    return res.json(data)

})

app.get('/check/:urlToForward', (req, res, next)=>{
    var {urlToForward}=req.params;

    shortUrl.findOne({'shorterUrl':urlToForward}, (err, data)=>{
        if(err)
        return res.send('Error reading database')
        var re=new RegExp("^(http|https)://", "i")
        var strToCheck=data.originalUrl;
        if(re.test(strToCheck)){
            re.redirect(301, data.originalUrl)
        }
        else{
            res.redirect(301, 'http://'+data.originalUrl)
        }
    })
})

app.use(express.static(__dirname + '/public'))




app.listen(PORT, ()=>{
    console.log(`We are connected on  ${PORT}`)
})