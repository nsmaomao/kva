import { h, Component, render, Store } from './dom'

var userStore = new Store({
    name : 'kyo',
    age : 18
})
userStore.onchange(function(data){
    console.log(data)
})
setTimeout(()=>{
    userStore.set('name','damaomao')
},3000)

class Welcome extends Component {
    constructor( props ) {
        super( props )
    }
    render() {
        let dom = <h1 className="num">number: {this.props.num}</h1>
        if (this.props.num>this.props.max) {
            dom = <h1 className="bignum">BigNumber: {this.props.num}</h1>
        }
        let dom2 = ''
        if (this.props.kyo) {
            dom2 = this.props.kyo
        }
        let dom3 = ''
        if (this.props.kyo2) {
            dom3 = this.props.kyo2
        }
        return <div>{dom} {dom2} {dom3}</div>
    }
}

class Counter extends Component {
    constructor( props ) {
        super( props );
        this.state.num = 1
        this.state.text = ''
    }

    onClick() {
        // this.setState( { num: this.state.num + 1 } );
        this.state.num = this.state.num+1
    }

    onInput(e) {
        this.state.text = e.target.value
    }

    render() {
        return (
            <div>
                <Welcome num={this.state.num} max={1}>
                    <slot name="kyo"><div>123={this.state.num}</div></slot>
                    <slot name="kyo2"><div>大饥荒</div> 123</slot>
                </Welcome>
                <Welcome num={this.state.num} max={3} />
                <Welcome num={this.state.num} max={5} />
                <button onClick={ () => this.onClick() }>add</button>
                <p></p>
                <input onInput={ (e)=> this.onInput(e) } value={this.state.text} />
                <p>{this.state.text}</p>
                <input onInput={ (e)=> this.onInput(e) } value={this.state.text} />
            </div>
        );
    }
}

render(
    <Counter />,
    document.getElementById('app')
);
