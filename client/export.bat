rmdir /S /Q export

bin\lime.py build game -o export\game.js -a

copy game\index.html export\
findstr /v /c:"noexport" <game\index.html >export\index.html