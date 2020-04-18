import { h } from "preact";
import { EntityPreview } from "./EntityPreview";
import { Menu } from "editor/components/Menu";
import { Source } from "editor/components/Source";
import { Divider } from "editor/components/Divider";
import { Title } from "editor/components/Title";
import { entities, entitiesData } from "data";

const Entities = ({
  entity,
  stateName = "default",
  habitatName = "default"
}) => {
  const activeEntity = entities(entity);
  const activeHabitat =
    activeEntity &&
    (activeEntity.habitats || []).find(({ name }) => name === habitatName);

  return (
    <section>
      <Title>Entities{entity && ` - ${entity}`}</Title>
      <Divider>
        <Menu
          hoverHide={activeEntity}
          items={Object.keys(entitiesData).map(name => [
            name,
            `/entities/${name}`
          ])}
        />
        <div>
          {activeEntity && activeEntity.states && (
            <Menu
              horizontal={true}
              items={[
                "default",
                ...Object.keys(activeEntity.states)
              ].map(key => [
                key,
                `/entities/${entity}/states/${key}/${habitatName}`
              ])}
            />
          )}
          {activeEntity && activeEntity.habitats && (
            <Menu
              horizontal={true}
              items={[
                "default",
                ...Object.values(activeEntity.habitats).map(h => h.name)
              ].map(key => [
                key,
                `/entities/${entity}/states/${stateName}/${key}`
              ])}
            />
          )}
          {entity && (
            <EntityPreview
              entity={entity}
              state={stateName}
              habitat={activeHabitat}
            />
          )}
          {activeEntity && <Source code={activeEntity} />}
        </div>
      </Divider>
    </section>
  );
};

export default Entities;
