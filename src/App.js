import React, { useState } from 'react';
import './App.css';
import {
    Box,
    TextField,
    Button,
    Card,
    CardHeader,
    CardActions,
    CardContent,
    Typography,
    Container,
    IconButton,
    Stack,
} from '@mui/material';
import WifiProtectedSetupIcon from '@mui/icons-material/WifiProtectedSetup';


function getDefinition(word){
    let KEY = process.env.REACT_APP_MERRIAM_DICTIONARY_KEY
    let url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${KEY}`
    return new Promise((resolve, reject)=>{
        fetch(url)
            .then(res=>resolve(res.json()))
            .catch(e=>reject(e));
    });
}

// https://media.merriam-webster.com/audio/prons/[language_code]/[country_code]/[format]/[subdirectory]/[base filename].[format]


function parseDefinitionResponse(res){
    console.log(res);
    let result = {
        definitions: [],
        etymologies: [],
        suggestedWords: [],
    }
    // If word isn't found, Merriam returns an array of suggestions
    // Check if this has occurred
    if(typeof res[0] == 'string'){
        result.suggestedWords = res;
        return result
    }

    // Merriam Responses have multiple responses/etymologies
    res.forEach(r=>{
        if('shortdef' in r){
            result.definitions.push(r.shortdef.join('\n'));
        }
        if('et' in r){
            result.etymologies.push(r.et[0].join('\n'));
        }
    })
    return result;
}

function FlashCard({word, wordType, definitions, etymologies}){
    definitions = definitions || [];
    etymologies = etymologies || [];

    const fixWordCase = word=>word.toLowerCase().replace(/\w\S*/g, w=>(w.replace(/^\w/, c=>c.toUpperCase())))

    return (
        <Card>
            <CardContent>
            <Stack direction="row" justifyContent="space-between">
                <Typography variant="h2">
                    {fixWordCase(word)}
                </Typography>
                <IconButton aria-label="settings">
                    <WifiProtectedSetupIcon />
                </IconButton>
            </Stack>
                
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {wordType}
                </Typography>
                <ol>
                    {definitions.map((d,i)=>(
                        <li key={`d_${i}`}>
                            <Typography variant="body1">{d}</Typography>
                        </li>
                    ))}
                </ol>
                <hr />
                <ol>
                    {etymologies.map((e,i)=>(
                        <li key={`e_${i}`}>
                            <Typography variant="caption">{e}</Typography>
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    )
}

function App(){
    const [wordInput, setWordInput]             = useState("");
    const [wordDefinitions, setWordDefinitions] = useState("");
    const [wordEtymologies, setWordEtymologies] = useState("");
    const [suggestedWords, setSuggestedWords]   = useState([]);
    const [showCard, setShowCard]               = useState(false);

    const resetResults = ()=>{
        setWordDefinitions("");
        setWordEtymologies("");
        setSuggestedWords([]);
        setShowCard(false);
    }
    const handleWordInput = e => {
        if(showCard){
            setShowCard(false);
        }
        setWordInput(e.target.value);

    }
    const handleGetDefinition = () => {
        resetResults();
        getDefinition(wordInput)
            .then(res=>{
                let parsedResponse = parseDefinitionResponse(res);
                if(parsedResponse.suggestedWords.length > 0){
                    setSuggestedWords(parsedResponse.suggestedWords)
                }else{
                    setWordDefinitions(parsedResponse.definitions);
                    setWordEtymologies(parsedResponse.etymologies);
                    setShowCard(true);
                }
            })
            .catch(e=>{
                console.error(e);
            });
    }

    return (
        <div className="App">
            <header className="App-header">
            {/* INPUT */}
            <TextField 
                id="standard-basic"
                label="Standard"
                variant="standard" 
                onChange={handleWordInput}
            />
            <Button variant="outlined" onClick={handleGetDefinition}>Search</Button>

            {/* RESULTS */}
            <Container maxWidth="sm">
            {showCard &&
                <FlashCard 
                    word={wordInput}
                    wordType='Adjective'
                    definitions={wordDefinitions}
                    etymologies={wordEtymologies}
                />
            }
            {suggestedWords.length > 0 && !showCard &&
                <div>
                    <p>Suggested Words</p>
                    <ul>
                        {suggestedWords.map(((word,i)=>(<li key={`word_${i}`}>{word}</li>)))}
                    </ul>
                </div>
            }
            </Container>
            </header>
        </div>
        );
    }

export default App;