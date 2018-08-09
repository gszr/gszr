all: cv.pdf cv.txt cv.html cv.docx

cv.pdf: cv.md
	pandoc --standalone -V geometry:"top=1.5cm, bottom=1.5cm" -o $@ $<

cv.txt: cv.md
	pandoc --standalone --from markdown --to plain -o $@ $<

cv.html: cv.md
	pandoc --standalone --css style.css --from markdown --to html -o $@ $<

cv.docx: cv.md
	pandoc --standalone --from markdown --to docx -o $@ $<

clean:
	rm -rf *.pdf *.txt *.html *.docx

.PHONY: all clean
