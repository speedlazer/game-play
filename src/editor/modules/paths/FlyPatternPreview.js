import { h, Component } from "preact";
import { unmount, mount, showFlyPattern } from "editor/lib/render-crafty";
import Preview from "editor/components/Preview";

const propChanged = (prevProps, props, checkChanged) =>
  checkChanged.some(prop => props[prop] !== prevProps[prop]);

export class FlyPatternPreview extends Component {
  constructor() {
    super();
    this.state = { craftyMounted: false };
  }

  mountCrafty = domElem => {
    mount(domElem);
    this.setState({ craftyMounted: true });
  };

  componentWillUnmount() {
    this.state.craftyMounted && unmount();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      (propChanged(prevProps, this.props, [
        "pattern",
        "showPoints",
        "showPath",
        "showHabitat"
      ]) &&
        this.state.craftyMounted) ||
      (this.props.pattern &&
        this.state.craftyMounted &&
        !prevState.craftyMounted)
    ) {
      showFlyPattern(this.props.pattern.path, {
        showPoints: this.props.showPoints,
        showPath: this.props.showPath,
        showHabitat: this.props.showHabitat,
        habitat: this.props.pattern.habitat
      });
    }
  }

  render() {
    return <Preview onMount={this.mountCrafty} />;
  }
}

export default FlyPatternPreview;
