import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';



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

function App(){
    const [wordInput, setWordInput]           = useState("");
    const [wordDefinition, setWordDefinition] = useState("");
    const [wordEtymology, setWordEtymology]   = useState("");
    const [suggestedWords, setSuggestedWords] = useState([]);

    const handleGetDefinition = () => {
        getDefinition(wordInput)
            .then(res=>{
                let parsedResponse = parseDefinitionResponse(res);
                if(parsedResponse.suggestedWords.length > 0){
                    setSuggestedWords(parsedResponse.suggestedWords)
                }else{
                    setWordDefinition(parsedResponse.definitions.join('\n'));
                    setWordEtymology(parsedResponse.etymologies.join('\n'));
                }
            })
            .catch(e=>{
                console.error(e);
            });
    }

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <Box>
                    <TextField 
                        id="standard-basic"
                        label="Standard"
                        variant="standard" 
                        onChange={e=>setWordInput(e.target.value)}
                    />
                    <Button variant="outlined" onClick={handleGetDefinition}>Search</Button>
                    {suggestedWords.length > 0 ?
                        <div>
                            <p>Suggested Words</p>
                            <ul>
                                {suggestedWords.map((word=>(<li>word</li>)))}
                            </ul>
                        </div>
                        :
                        <div>
                            <p>Definition</p>
                            <hr />
                            <i>{wordDefinition}</i>
                            <p>Etymology</p>
                            <hr />
                            <i>{wordEtymology}</i>
                        </div>
                    }
                </Box>
            </header>
        </div>
        );
    }

export default App;