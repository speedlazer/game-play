import { h, Component } from "preact";
import { Title } from "editor/components/Title";
import { CentralMenu } from "editor/components/CentralMenu";
import { Source } from "editor/components/Source";
import { Divider } from "editor/components/Divider";
import { Setting } from "editor/components/Setting";
import FlyPatternPreview from "./FlyPatternPreview";
import { paths } from "data";

const DEFAULT_STATE = {
  showPoints: true,
  showPath: true,
  showHabitat: true
};

const STORAGE_KEY = "editor-flyPattern-settings";
const storeState = newState =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

const storedState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (e) {
    return {};
  }
};

class FlyPatterns extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...DEFAULT_STATE,
      ...storedState()
    };
  }

  updateShowPoints = checked => {
    this.setState(s => ({ ...s, showPoints: checked }));
  };

  updateShowPath = checked => {
    this.setState(s => ({ ...s, showPath: checked }));
  };

  updateShowHabitat = checked => {
    this.setState(s => ({ ...s, showHabitat: checked }));
  };

  render({ pattern }, { showPoints, showPath, showHabitat }) {
    const activePattern = paths(pattern);
    storeState(this.state);
    return (
      <section>
        <Title>Paths{pattern && ` - ${pattern}`}</Title>
        <Divider>
          <CentralMenu hoverHide={activePattern} root="paths" />
          <div>
            <div>
              <Setting checked={showPoints} onCheck={this.updateShowPoints}>
                Show points
              </Setting>
              <Setting checked={showPath} onCheck={this.updateShowPath}>
                Show path
              </Setting>
              <Setting checked={showHabitat} onCheck={this.updateShowHabitat}>
                Show habitat
              </Setting>
            </div>
            {activePattern && (
              <FlyPatternPreview
                pattern={activePattern}
                showPath={showPath}
                showPoints={showPoints}
                showHabitat={showHabitat}
              />
            )}
            {activePattern && <Source code={activePattern} />}
          </div>
        </Divider>
      </section>
    );
  }
}

export default FlyPatterns;
