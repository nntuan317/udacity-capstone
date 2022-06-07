import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Item
} from 'semantic-ui-react'

import { createRecipe, deleteRecipe, getRecipes, patchRecipe } from '../api/recipes-api'
import Auth from '../auth/Auth'
import { Recipe } from '../types/Recipe'

interface RecipesProps {
  auth: Auth
  history: History
}

interface RecipesState {
  recipes: Recipe[]
  newRecipeName: string
  newRecipeDescription: string
  loadingRecipes: boolean
}

interface StyleSheet {
  [key: string]: React.CSSProperties
}

const styles: StyleSheet = {
  descriptionInput: {
    marginTop: 10,
    width: '100%',
    minHeight: 150,
    resize: 'none',
    paddingTop: 9.5,
    paddingBottom: 9.5,
    paddingLeft: 14,
    paddingRight: 14
  },
  newRecipe: {
    display: 'flex',
    flexDirection: 'row-reverse'
  },
  recipeList: {
    display: 'flex',
    flexDirection: 'column'
  },
  recipeItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  recipeItemContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  attachment: {
    width: '20%'
  },
  recipeItemTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    marginLeft: 8,
    marginRight: 8
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  description: {
    whiteSpace: 'pre-line',
    marginTop: 8
  },
  buttonContainer: {
    width: '15%',
    display: 'flex',
    flexDirection: 'row'
  }
}

export class Recipes extends React.PureComponent<RecipesProps, RecipesState> {
  state: RecipesState = {
    recipes: [],
    newRecipeName: '',
    newRecipeDescription: '',
    loadingRecipes: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newRecipeName: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ newRecipeDescription: event.target.value })
  }

  onEditButtonClick = (recipeId: string) => {
    this.props.history.push(`/recipes/${recipeId}/edit`)
  }

  onRecipeCreate = async () => {
    try {
      const newRecipe = await createRecipe(this.props.auth.getIdToken(), {
        name: this.state.newRecipeName,
        description: this.state.newRecipeDescription
      })
      this.setState({
        recipes: [...this.state.recipes, newRecipe],
        newRecipeName: ''
      })
    } catch {
      alert('Recipe creation failed')
    }
  }

  onRecipeDelete = async (recipeId: string) => {
    try {
      await deleteRecipe(this.props.auth.getIdToken(), recipeId)
      this.setState({
        recipes: this.state.recipes.filter(recipe => recipe.recipeId !== recipeId)
      })
    } catch {
      alert('Recipe deletion failed')
    }
  }

  onRecipeCheck = async (pos: number) => {
    try {
      alert('Recipe update failed')
      // const recipe = this.state.recipes[pos]
      // await patchRecipe(this.props.auth.getIdToken(), recipe.recipeId, {
      //   name: recipe.name,
      //   description: recipe.description,
      //   favorite: !recipe.favorite
      // })
      // this.setState({
      //   recipes: update(this.state.recipes, {
      //     [pos]: { favorite: { $set: !recipe.favorite } }
      //   })
      // })
    } catch {
      alert('Recipe deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const recipes = await getRecipes(this.props.auth.getIdToken())
      this.setState({
        recipes,
        loadingRecipes: false
      })
    } catch (e) {
      let errorMessage = "Something went wrong"
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      alert(`Failed to fetch recipes: ${errorMessage}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">RECIPEs</Header>

        {this.renderCreateRecipeInput()}

        {this.renderRecipes()}
      </div>
    )
  }

  renderCreateRecipeInput() {
    return (
      <div>
        <Input
          fluid
          placeholder="Name"
          onChange={this.handleNameChange}
        />
        <textarea style={styles.descriptionInput} placeholder="Description" onChange={this.handleDescriptionChange} />
        <div style={styles.newRecipe}>
          <Button icon labelPosition='left' onClick={this.onRecipeCreate} color='blue'><Icon name='add' />New Recipe</Button>
        </div>
        <Divider />
      </div>
    )
  }

  renderRecipes() {
    if (this.state.loadingRecipes) {
      return this.renderLoading()
    }

    return this.renderRecipesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading RECIPEs
        </Loader>
      </Grid.Row>
    )
  }

  renderRecipesList() {
    return (
      <div style={styles.recipeList}>
        {this.state.recipes.map((recipe, pos) => {
          return (
            <div style={styles.recipeItem}>
              <div style={styles.recipeItemContent}>
                <div style={styles.attachment}>
                  {recipe.attachmentUrl && (
                    <Image src={recipe.attachmentUrl} size="small" wrapped />
                  )}
                </div>
                <div style={styles.recipeItemTextContainer}>
                  <div style={styles.name}>
                    {recipe.name}
                  </div>
                  <p style={styles.description}>{recipe.description}</p>
                </div>
                <div style={styles.buttonContainer}>
                  <Button
                    icon
                    color="blue"
                    onClick={() => this.onEditButtonClick(recipe.recipeId)}
                  >
                    <Icon name="pencil" />
                  </Button>
                  <Button
                    icon
                    onClick={() => this.onRecipeCheck(pos)}
                  >
                    <Icon name='heart' color={recipe.favorite ? 'red' : 'grey'} />
                  </Button>
                  <Button
                    icon
                    color="red"
                    onClick={() => this.onRecipeDelete(recipe.recipeId)}
                  >
                    <Icon name="delete" />
                  </Button>
                </div>
              </div>
              <Divider />
            </div>
          )
        })}
      </div>
    )
  }
}