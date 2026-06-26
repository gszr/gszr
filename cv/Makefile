IMAGE_NAME := cv-builder
DOCKER_RUN := docker run --rm -v $(CURDIR):/data -w /data $(IMAGE_NAME)

all: files/cv.pdf files/cv.txt files/cv.html files/cv.docx

image:
	docker build -t $(IMAGE_NAME) .

generated: src/cv.yaml src/schema.json src/theme.json src/render.mjs src/style.css image
	$(DOCKER_RUN) node src/render.mjs

files/cv.md files/cv.html files/cv.txt: generated

files/cv.pdf: src/cv.yaml src/theme.json src/templates/cv.typ image
	$(DOCKER_RUN) typst compile --root . src/templates/cv.typ $@

files/cv.docx: files/cv.md image
	$(DOCKER_RUN) pandoc --standalone --from markdown --to docx -o $@ $<

clean:
	rm -f files/cv.pdf files/cv.txt files/cv.html files/cv.docx files/cv.md

.PHONY: all image generated clean
