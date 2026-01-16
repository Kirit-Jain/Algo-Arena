import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, onChange }) => {
    const handleEditorChange = (value) => {
        onChange(value);
    };

    return (
        <div className="editor-container" style={{ width: "100%", height: "100%"}}>
            <Editor
                height="100%"
                defaultLanguage="cpp"
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                    fontSize: 14,
                    minimap: {enabled: false},
                    automaticLayout: true
                }}
            />
        </div>  
    );
};

export default CodeEditor;