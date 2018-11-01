# Kva
A simple javascript framework, like react & vue.

## Getting started

```
npm install kva --save
import { h, Component, render, Store } from './kva'
```

## Create a component

```
class Welcome extends Component {
    constructor( props ) {
        super( props )
    }
    render() {
        return <div>kva</div>
    }
}
```

## Store

```
var userStore = new Store({
    name : 'kyo',
    age : 18
})
userStore.onchange(function(data){
    console.log(data)
})

userStore.set('name','kva')
```

# Slot

```
render :
<Welcome>
    <slot name="kyo"><div>kva</div></slot>
    <slot name="kyo2"><div>hello</div> <div>world</div></slot>
</Welcome>

in component :
render() {
    return (
        <div>
            {this.props.kyo}
            {this.props.kyo2}
        </div>
    )
}
```