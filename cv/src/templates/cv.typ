#let cv = yaml("../cv.yaml")
#let theme = json("../theme.json")

#let ink = rgb(theme.ink)
#let muted = rgb(theme.muted)
#let accent = rgb(theme.accent)
#let line-color = rgb(theme.line)

#set document(title: cv.name + " - CV", author: cv.name)
#set page(
  paper: "a4",
  margin: (x: 1.35cm, y: 1.35cm),
)
#set text(font: "Noto Sans", size: 8.4pt, fill: ink, lang: "en")
#set par(justify: false, leading: 0.68em)

#let slash = text(fill: muted, " / ")

#let contact(item) = {
  if item.url != none {
    link(item.url)[#item.label]
  } else {
    item.label
  }
}

#let section-title(title) = {
  v(0.62em)
  grid(
    columns: (3.2cm, 1fr),
    column-gutter: 0.55cm,
    align: horizon,
      text(size: 7pt, weight: "bold", fill: accent, tracking: 0.09em)[#upper(title)],
    line(length: 100%, stroke: 0.45pt + line-color),
  )
  v(0.12em)
}

#let entry-heading(title, organization, period) = {
  grid(
    columns: (1fr, auto),
    column-gutter: 0.7cm,
    align: top,
    {
      text(weight: "bold", size: 9.4pt)[#title]
      text(fill: muted)[ #organization]
    },
    text(fill: muted, size: 8pt)[#period],
  )
}

#let bullet-list(items) = {
  v(0.2em)
  for item in items {
    grid(
      columns: (0.28cm, 1fr),
      column-gutter: 0.06cm,
      align: top,
      text(size: 7.2pt)[•],
      block(width: 100%)[#item],
    )
    v(0.16em)
  }
}

#let experience-entry(entry) = {
  entry-heading(entry.role, entry.organization, entry.period)
  bullet-list(entry.highlights.map(highlight => {
    if highlight.label != none {
      [#strong(highlight.label)#text(fill: muted, " - ")#highlight.text]
    } else {
      [#highlight.text]
    }
  }))
  v(0.36em)
}

#let education-entry(entry) = {
  entry-heading(entry.degree, entry.organization, entry.period)
  bullet-list(entry.highlights.map(highlight => [#highlight]))
  v(0.25em)
}

#let technical-row(group) = {
  [#strong(group.label): #group.items.join(", ")]
}

#align(center)[
  #text(font: "Noto Serif", size: 24pt, weight: "regular")[#cv.name]

  #v(0.25em)
  #text(fill: muted, size: 7.9pt)[
    #cv.location #slash
    #for index in range(cv.contacts.len()) {
      let item = cv.contacts.at(index)
      contact(item)
      if index < cv.contacts.len() - 1 {
        slash
      }
    }
  ]

  #v(0.55em)
  #block(width: 91%)[
    #text(style: "italic", fill: muted, size: 8.3pt)[#cv.summary]
  ]
]

#section-title("Experience")
#for entry in cv.experience {
  experience-entry(entry)
}

#section-title("Education")
#for entry in cv.education {
  education-entry(entry)
}

#section-title("Technical")
#grid(
  columns: (1fr, 1fr),
  column-gutter: 0.7cm,
  row-gutter: 0.18em,
  ..cv.technical.map(technical-row)
)

#section-title("Associations")
#bullet-list(cv.associations.map(item => [#item]))
