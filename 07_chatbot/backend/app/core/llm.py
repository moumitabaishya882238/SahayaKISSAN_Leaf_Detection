from langchain_community.llms import Ollama

llm=Ollama(
    model="phi",
    temperature=0.3
)