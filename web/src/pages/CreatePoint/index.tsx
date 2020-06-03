import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from 'react';
import { TileLayer, Map, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import { useHistory } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

import './styles.css';

import Header from '../../components/Header';
import api from '../../services/api';

interface ItemInterface {
  id: number;
  title: string;
  imageUrl: string;
}

interface IBGEUfResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<ItemInterface[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [ufs, setUfs] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState('');

  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');

  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>(
    initialPosition,
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const history = useHistory();

  useEffect(() => {
    api
      .get('/items')
      .then((response) => {
        setItems(
          response.data.map((item: any) => {
            return { ...item, imageUrl: item.image_url, isSelected: false };
          }),
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUfResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome',
      )
      .then((response) => {
        const ufInitials = response.data.map((uf: IBGEUfResponse) => uf.sigla);

        setUfs(ufInitials);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleSelectUf = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      event.preventDefault();

      const { value } = event.target;
      setSelectedUf(value);
    },
    [],
  );

  useEffect(() => {
    if (selectedUf !== '')
      axios
        .get<IBGECityResponse[]>(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`,
        )
        .then((response) => {
          const citiesArr = response.data;

          setCities(
            citiesArr.map((city: IBGECityResponse): string => city.nome),
          );
        });
  }, [selectedUf]);

  const handleSelectCity = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      event.preventDefault();
      const { value } = event.target;
      setSelectedCity(value);
    },
    [],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;

      setFormData({ ...formData, [name]: value });
    },
    [formData],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const { name, email, whatsapp } = formData;
      const uf = selectedUf;
      const city = selectedCity;
      const [latitude, longitude] = selectedPosition;

      const data = {
        name,
        email,
        whatsapp,
        uf,
        city,
        latitude,
        longitude,
        items: selectedItems,
      };
      try {
        await api.post('/points', data);
        setShowSuccess(true);
        setInterval(() => {
          setShowSuccess(false);
          history.push('/');
        }, 2000);
      } catch (error) {
        console.log(error);
      }
    },
    [
      formData,
      selectedUf,
      selectedCity,
      selectedPosition,
      selectedItems,
      history,
    ],
  );

  const toggleSelectItem = useCallback(
    (id: number) => {
      const alreadySelected = selectedItems.findIndex((item) => item === id);

      if (alreadySelected < 0) {
        setSelectedItems([...selectedItems, id]);
      } else {
        setSelectedItems(selectedItems.filter((item) => item !== id));
      }
    },
    [selectedItems],
  );

  const handleMapClick = useCallback((event: LeafletMouseEvent) => {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);

  return (
    <>
      {showSuccess && (
        <div className="success-div">
          <FiCheckCircle />
          <span>Cadastro concluído!</span>
        </div>
      )}
      <div id="page-create-point" style={{ zIndex: 0 }}>
        <Header link="/" />
        <form onSubmit={handleSubmit}>
          <h1>
            Cadastro do <br /> ponto de coleta
          </h1>
          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input
                type="text"
                name="name"
                id="name"
                onChange={handleInputChange}
              />
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleInputChange}
                />
              </div>

              <div className="field">
                <label htmlFor="whatsapp">Whatsapp</label>
                <input
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa.</span>
            </legend>

            <Map
              style={{ zIndex: 0 }}
              center={initialPosition}
              zoom={15}
              onClick={handleMapClick}
            >
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={selectedPosition} />
            </Map>

            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">UF</label>
                <select
                  name="uf"
                  id="uf"
                  onChange={handleSelectUf}
                  value={selectedUf}
                >
                  <option value="0">Selecione uma UF</option>
                  {ufs.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select
                  name="city"
                  id="city"
                  onChange={handleSelectCity}
                  value={selectedCity}
                >
                  <option value="0">Selecione uma cidade</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Ítens de coleta</h2>
              <span>Selecione um ou mais ítens abaixo.</span>
            </legend>

            <ul className="items-grid">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={
                    selectedItems.includes(item.id)
                      ? 'selected'
                      : 'not-selected'
                  }
                  onClick={() => toggleSelectItem(item.id)}
                >
                  <img src={item.imageUrl} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>

            <button type="submit">Cadastrar ponto de coleta</button>
          </fieldset>
        </form>
      </div>
    </>
  );
};

export default CreatePoint;
