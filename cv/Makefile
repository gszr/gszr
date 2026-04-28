IMAGE_NAME := cv-builder
DOCKER_RUN := docker run --rm -v $(CURDIR):/data -w /data --entrypoint pandoc $(IMAGE_NAME)

all: cv.pdf cv.txt cv.html cv.docx

image:
	docker build -t $(IMAGE_NAME) .

cv.pdf: cv.md image
	$(DOCKER_RUN) --standalone --template=template.tex -o $@ $<

cv.txt: cv.md image
	$(DOCKER_RUN) --standalone --from markdown --to plain -o $@ $<

cv.html: cv.md image
	$(DOCKER_RUN) --standalone --css style.css --from markdown --to html -o $@ $<

cv.docx: cv.md image
	$(DOCKER_RUN) --standalone --from markdown --to docx -o $@ $<

clean:
	rm -rf *.pdf *.txt *.html *.docx

.PHONY: all image clean
