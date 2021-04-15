import React, { useEffect, useState } from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import Moment from "react-moment"
import Layout from "../components/layout"
import Markdown from "react-markdown"

export const query = graphql`
  query MyQuery($slug: String!) {
    strapiArticle(slug: { eq: $slug }, status: { eq: "published" }) {
      id
      author {
        id
        picture {
          url
        }
        name
      }
      category {
        name
        slug
      }
      content
      description
      created_at
      image {
        publicURL
      }
      title
      updated_at
      publishedAt
    }
  }
`

const Article = ({ data }) => {
  const article = data.strapiArticle
  const seo = {
    metaTitle: article.title,
    metaDescription: article.description,
    shareImage: article.image,
    article: true,
  }
  //le hook de react
  const [comments, setComments] = useState([])
  //il faut récuperer les comments du back et les save ds une variable commentaires
  const getTheCommentaires = () => {
    fetch(
      "https://page-blog-strapi.herokuapp.com/comments?article= " +
        article.strapiId
    )
      .then(reponse => reponse.json())
      .then(datas => {
        const commentsAAfficher = datas.map(data => {
          const date = new Date(data.published_at).toLocaleString("fr")
          //on veut aussi recuperer la date de publication
          return (
            <div className="comments">
              <div className="auteur">{data.auteur}</div>
              <div className="texte">{data.texte}</div>
              <div className="date">{date}</div>
            </div>
          )
        })
        //peut etre qu il y qura une erreur ici
        setComments(commentsAAfficher)
      })
  }
  //on a besoin d une fonction qd on envoie le formulaire
  const envoie = evenement => {
    evenement.preventDefault()
    const auteur = evenement.target.auteur.value
    const texte = evenement.target.texte.value

    const data = {
      auteur,
      texte,
      article: article.strapiId,
    }

    fetch("https://page-blog-strapi.herokuapp.com/comments", {
      method: "Post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        getTheCommentaires()
      })
      .catch(err => console.error)
  }
  //isolation de la fonction de fetch pour qu'elle soie exécutée qu'une fois pour ne pas se faire expulser violamement par heroku
  useEffect(getTheCommentaires, [article])

  return (
    <Layout seo={seo}>
      <div>
        <div
          id="banner"
          className="uk-height-medium uk-flex uk-flex-center uk-flex-middle uk-background-cover uk-light uk-padding uk-margin"
          data-src={article.image.publicURL}
          data-srcset={article.image.publicURL}
          data-uk-img
        >
          <h1>{article.title}</h1>
        </div>

        <div className="uk-section">
          <div className="uk-container uk-container-small">
            <Markdown source={article.content} escapeHtml={false} />

            <hr className="uk-divider-small" />

            <div className="uk-grid-small uk-flex-left" data-uk-grid="true">
              <div>
                {article.author.picture && (
                  <Img
                    fixed={article.author.picture.publicURL}
                    imgStyle={{ position: "static", borderRadius: "50%" }}
                  />
                )}
              </div>
              <div className="uk-width-expand">
                <p className="uk-margin-remove-bottom">
                  By {article.author.name}
                </p>
                <p className="uk-text-meta uk-margin-remove-top">
                  <Moment format="MMM Do YYYY">{article.published_at}</Moment>
                </p>
              </div>
            </div>
            <form onSubmit={envoie}>
              <input type="text" name="auteur" placeholder="Nom" />
              <input type="text" name="texte" placeholder="Commentaire" />
              <button type="submit">Envoyer</button>
            </form>
            <div className="comments">{comments}</div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Article
